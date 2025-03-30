import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
from config import Config

# Load configuration
config = Config()

# Create model directory if it doesn't exist
os.makedirs(config.MODEL_DIR, exist_ok=True)

# Load dataset
print("Loading dataset from:", config.DATASET_PATH)
df = pd.read_csv(config.DATASET_PATH)

# Preprocess data: separate features and target
X = df.drop(columns=["target"])
y = df["target"]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Build the neural network model using scikit-learn's MLPClassifier
model_nn = MLPClassifier(
    hidden_layer_sizes=(64, 32),  # Two hidden layers with 64 and 32 neurons
    activation='relu',
    solver='adam',
    alpha=0.0001,  # L2 regularization
    batch_size=16,
    learning_rate='adaptive',
    max_iter=500,
    early_stopping=True,
    validation_fraction=0.2,
    random_state=42
)

# Train the model
print("Training neural network model...")
model_nn.fit(X_train, y_train)

# Evaluate model
y_pred = model_nn.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Neural Network Model Accuracy: {accuracy*100:.2f}%")

# Save the model and scaler
print(f"Saving neural network model to {config.NN_MODEL_PATH.replace('.h5', '.pkl')}")
joblib.dump(model_nn, config.NN_MODEL_PATH.replace('.h5', '.pkl'))

print(f"Saving scaler to {config.NN_SCALER_PATH}")
joblib.dump(scaler, config.NN_SCALER_PATH)

print("Neural Network Model and Scaler saved successfully!")
