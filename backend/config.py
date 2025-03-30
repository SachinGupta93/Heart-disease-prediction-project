import os

class Config:
    """Configuration settings for the Heart Disease Prediction application."""
    
    def __init__(self):
        # Base directories
        self.BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        self.MODEL_DIR = os.path.join(self.BASE_DIR, "model")
        self.DATASET_PATH = os.path.join(os.path.dirname(self.BASE_DIR), "dataset", "heart.csv")
        
        # Ensure model directory exists
        os.makedirs(self.MODEL_DIR, exist_ok=True)
        
        # Model paths
        self.RF_MODEL_PATH = os.path.join(self.MODEL_DIR, "heart_model.pkl")
        self.RF_SCALER_PATH = os.path.join(self.MODEL_DIR, "scaler.pkl")
        self.NN_MODEL_PATH = os.path.join(self.MODEL_DIR, "neural_network_model.h5")
        self.NN_SCALER_PATH = os.path.join(self.MODEL_DIR, "scaler_nn.pkl")
        
        # API settings
        self.API_HOST = "0.0.0.0"
        self.API_PORT = 5000
        self.DEBUG_MODE = True
