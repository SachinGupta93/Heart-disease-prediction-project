"""
Main training script for the Heart Disease Prediction project.
"""

import logging
import joblib
import os
from config import Config
from data_processor import DataProcessor
from model_trainer import ModelTrainer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Main function to run the training pipeline."""
    try:
        logger.info("Starting Heart Disease Prediction model training...")
        
        # Load configuration
        config = Config()
        
        # Process data
        logger.info("Processing data...")
        data_processor = DataProcessor(config)
        X_train, X_test, X_train_scaled, X_test_scaled, y_train, y_test = data_processor.process()
        
        # Save the scaler for later use
        logger.info(f"Saving scaler to {config.RF_SCALER_PATH}")
        joblib.dump(data_processor.scaler, config.RF_SCALER_PATH)
        
        # Train models
        model_trainer = ModelTrainer(config)
        
        # Train and evaluate Random Forest
        logger.info("Training Random Forest model...")
        rf_model, feature_importance = model_trainer.train_random_forest(
            X_train, y_train, X_test, y_test
        )
        
        # Train and evaluate Neural Network
        logger.info("Training Neural Network model...")
        nn_model, history = model_trainer.train_neural_network(
            X_train_scaled, y_train, X_test_scaled, y_test
        )
        
        # Save feature importance for later use
        feature_importance_path = os.path.join(config.MODEL_DIR, "feature_importance.csv")
        feature_importance.to_csv(feature_importance_path, index=False)
        logger.info(f"Feature importance saved to {feature_importance_path}")
        
        logger.info("Model training completed successfully!")
        
    except Exception as e:
        logger.exception(f"Error in training pipeline: {str(e)}")
        raise

if __name__ == "__main__":
    main()
