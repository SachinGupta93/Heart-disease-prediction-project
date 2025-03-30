import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

# Load dataset (adjust path as needed)
df = pd.read_csv("dataset/heart.csv")

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
model_nn.fit(X_train, y_train)

# Evaluate model
y_pred = model_nn.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Neural Network Model Accuracy: {accuracy*100:.2f}%")

# Save the model and scaler
joblib.dump(model_nn, "model/neural_network_model.pkl")
joblib.dump(scaler, "model/scaler_nn.pkl")
print("Neural Network Model and Scaler saved successfully!")
