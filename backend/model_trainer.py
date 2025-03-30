"""
Model training module for the Heart Disease Prediction project.
"""

import numpy as np
import pandas as pd
import joblib
import os
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, config):
        self.config = config
    
    def train_random_forest(self, X_train, y_train, X_test, y_test):
        """Train a Random Forest model with hyperparameter tuning."""
        logger.info("Training Random Forest model...")
        
        # Define parameter grid for hyperparameter tuning
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [None, 10, 20, 30],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        # Create base model
        rf = RandomForestClassifier(random_state=self.config.RANDOM_SEED)
        
        # Perform grid search with cross-validation
        logger.info("Performing grid search for hyperparameter tuning...")
        grid_search = GridSearchCV(
            estimator=rf,
            param_grid=param_grid,
            cv=5,
            scoring='accuracy',
            n_jobs=-1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Get best model
        best_rf = grid_search.best_estimator_
        logger.info(f"Best parameters: {grid_search.best_params_}")
        
        # Evaluate model
        y_pred = best_rf.predict(X_test)
        y_prob = best_rf.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred)
        matrix = confusion_matrix(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        
        logger.info(f"Random Forest Accuracy: {accuracy:.4f}")
        logger.info(f"Random Forest AUC: {auc:.4f}")
        logger.info(f"Classification Report:\n{report}")
        logger.info(f"Confusion Matrix:\n{matrix}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': X_train.columns,
            'importance': best_rf.feature_importances_
        }).sort_values('importance', ascending=False)
        
        logger.info(f"Feature Importance:\n{feature_importance.head(10)}")
        
        # Save model
        logger.info(f"Saving Random Forest model to {self.config.RF_MODEL_PATH}")
        joblib.dump(best_rf, self.config.RF_MODEL_PATH)
        
        return best_rf, feature_importance
    
    def train_neural_network(self, X_train_scaled, y_train, X_test_scaled, y_test):
        """Train a Neural Network model."""
        logger.info("Training Neural Network model...")
        
        # Create model
        model = Sequential([
            Dense(self.config.NN_HIDDEN_LAYERS[0], activation='relu', input_dim=X_train_scaled.shape[1]),
            Dropout(self.config.NN_DROPOUT_RATE),
            Dense(self.config.NN_HIDDEN_LAYERS[1], activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Early stopping to prevent overfitting
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        )
        
        # Train model
        history = model.fit(
            X_train_scaled, y_train,
            epochs=self.config.NN_EPOCHS,
            batch_size=self.config.NN_BATCH_SIZE,
            validation_split=self.config.NN_VALIDATION_SPLIT,
            callbacks=[early_stop],
            verbose=1
        )
        
        # Evaluate model
        loss, accuracy = model.evaluate(X_test_scaled, y_test)
        y_prob = model.predict(X_test_scaled).flatten()
        y_pred = (y_prob > 0.5).astype(int)
        
        report = classification_report(y_test, y_pred)
        matrix = confusion_matrix(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        
        logger.info(f"Neural Network Accuracy: {accuracy:.4f}")
        logger.info(f"Neural Network AUC: {auc:.4f}")
        logger.info(f"Classification Report:\n{report}")
        logger.info(f"Confusion Matrix:\n{matrix}")
        
        # Save model
        logger.info(f"Saving Neural Network model to {self.config.NN_MODEL_PATH}")
        model.save(self.config.NN_MODEL_PATH)
        
        return model, history
