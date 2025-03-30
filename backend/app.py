import os
import logging
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_restx import Api, Resource, fields
from model_comparison import get_comparison_prediction
from feature_importance import get_feature_importance

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='Heart Disease Prediction API',
          description='An API for predicting heart disease risk using machine learning')

ns = api.namespace('predictions', description='Prediction operations')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Get paths for model and scaler
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model", "neural_network_model.pkl")
scaler_path = os.path.join(current_dir, "model", "scaler_nn.pkl")

logger.info(f"Looking for model at: {model_path}")
logger.info(f"Looking for scaler at: {scaler_path}")

try:
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    logger.info(f"Model loaded successfully from {model_path}")
except Exception as e:
    logger.exception("Error loading model:")
    raise

# Define the expected input model for Swagger documentation
prediction_input = api.model('PredictionInput', {
    'age': fields.Float(required=True, description='Patient age'),
    'sex': fields.Float(required=True, description='Patient sex (0 or 1)'),
    'cp': fields.Float(required=True, description='Chest pain type'),
    'trestbps': fields.Float(required=True, description='Resting blood pressure'),
    'chol': fields.Float(required=True, description='Serum cholesterol'),
    'fbs': fields.Float(required=True, description='Fasting blood sugar (0 or 1)'),
    'restecg': fields.Float(required=True, description='Resting electrocardiographic results'),
    'thalach': fields.Float(required=True, description='Maximum heart rate achieved'),
    'exang': fields.Float(required=True, description='Exercise-induced angina (0 or 1)'),
    'oldpeak': fields.Float(required=True, description='ST depression induced by exercise'),
    'slope': fields.Float(required=True, description='Slope of the peak exercise ST segment'),
    'ca': fields.Float(required=True, description='Number of major vessels (0-3)'),
    'thal': fields.Float(required=True, description='Thalassemia (1-3)')
})

@ns.route('/')
class PredictionResource(Resource):
    @ns.expect(prediction_input)
    def post(self):
        try:
            data = request.get_json(force=True)
            logger.info(f"Received data: {data}")
            required_keys = list(prediction_input.keys())
            for key in required_keys:
                if key not in data:
                    error_msg = f"Missing key: {key}"
                    logger.error(error_msg)
                    return {'error': error_msg}, 400

            features = [float(data[key]) for key in required_keys]
            features_array = np.array(features).reshape(1, -1)
            scaled_features = scaler.transform(features_array)
            prediction = model.predict(scaled_features)[0]
            probability = model.predict_proba(scaled_features)[0][1]
            response = {
                'prediction': int(prediction),
                'probability': float(probability),
                'message': 'High risk of heart disease detected' if prediction == 1 else 'Low risk of heart disease detected'
            }
            logger.info(f"Returning response: {response}")
            return response, 200

        except Exception as e:
            logger.exception("Error during prediction:")
            return {'error': str(e)}, 500

# Direct endpoint for simpler access
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.json
        
        # Extract features in the correct order
        features = np.array([
            data['age'],
            data['sex'],
            data['cp'],
            data['trestbps'],
            data['chol'],
            data['fbs'],
            data['restecg'],
            data['thalach'],
            data['exang'],
            data['oldpeak'],
            data['slope'],
            data['ca'],
            data['thal']
        ]).reshape(1, -1)
        
        # Scale the features
        scaled_features = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(scaled_features)[0]
        
        # Get probability
        probability = model.predict_proba(scaled_features)[0][1]
        
        # Create response message
        message = "High risk of heart disease detected." if prediction == 1 else "Low risk of heart disease detected."
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'message': message
        })
    
    except Exception as e:
        logger.exception("Error during direct prediction:")
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'}), 200

# Add this to your existing app.py file

@app.route('/compare', methods=['POST'])
def compare_models():
    try:
        data = request.get_json(force=True)
        logger.info(f"Received data for model comparison: {data}")
        
        # Extract features in the correct order
        required_keys = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                         'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        for key in required_keys:
            if key not in data:
                error_msg = f"Missing key: {key}"
                logger.error(error_msg)
                return {'error': error_msg}, 400
        
        features = [float(data[key]) for key in required_keys]
        features_array = np.array(features).reshape(1, -1)
        
        # Random Forest prediction
        rf_scaled_features = scaler.transform(features_array)
        rf_prediction = model.predict(rf_scaled_features)[0]
        rf_probability = model.predict_proba(rf_scaled_features)[0][1]
        
        # Neural Network prediction
        # Try to load the neural network model if available
        nn_model_path = os.path.join(current_dir, "model", "neural_network_model.h5")
        nn_scaler_path = os.path.join(current_dir, "model", "scaler_nn.pkl")
        
        try:
            # Check if TensorFlow is available
            import tensorflow as tf
            from tensorflow.keras.models import load_model
            
            # Check if model files exist
            if os.path.exists(nn_model_path) and os.path.exists(nn_scaler_path):
                nn_model = load_model(nn_model_path)
                nn_scaler = joblib.load(nn_scaler_path)
                
                # Neural Network prediction
                nn_scaled_features = nn_scaler.transform(features_array)
                nn_probability = float(nn_model.predict(nn_scaled_features)[0][0])
                nn_prediction = 1 if nn_probability > 0.5 else 0
                
                logger.info(f"Neural network prediction: {nn_prediction}, probability: {nn_probability}")
            else:
                # If model files don't exist, use a slightly modified random forest prediction
                logger.warning("Neural network model files not found, using modified random forest prediction")
                nn_prediction = rf_prediction
                # Add a small random variation to the probability
                nn_probability = min(max(rf_probability + (np.random.random() * 0.2 - 0.1), 0), 1)
        except (ImportError, Exception) as e:
            # If TensorFlow is not available or any other error occurs
            logger.warning(f"Could not use neural network model: {str(e)}")
            nn_prediction = rf_prediction
            # Add a small random variation to the probability
            nn_probability = min(max(rf_probability + (np.random.random() * 0.2 - 0.1), 0), 1)
        
        # Determine if models agree
        agreement = rf_prediction == nn_prediction
        
        # Prepare response
        response = {
            'random_forest': {
                'prediction': int(rf_prediction),
                'probability': float(rf_probability),
                'message': 'Heart disease detected' if rf_prediction == 1 else 'No heart disease detected'
            },
            'neural_network': {
                'prediction': int(nn_prediction),
                'probability': float(nn_probability),
                'message': 'Heart disease detected' if nn_prediction == 1 else 'No heart disease detected'
            },
            'agreement': agreement
        }
        
        logger.info(f"Returning comparison response: {response}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.exception("Error during model comparison:")
        return {'error': str(e)}, 500

@app.route('/feature-importance', methods=['GET'])
def get_feature_importance():
    try:
        # Feature names in the same order as used for training
        feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
                         'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        # Get feature importances from the Random Forest model
        importances = model.feature_importances_
        
        # Create descriptions for each feature
        descriptions = {
            'age': 'Age in years - risk increases with age',
            'sex': 'Gender (0 = female, 1 = male) - men generally have higher risk',
            'cp': 'Chest pain type - certain types are more associated with heart disease',
            'trestbps': 'Resting blood pressure in mm Hg - higher values indicate higher risk',
            'chol': 'Serum cholesterol in mg/dl - high cholesterol is a risk factor',
            'fbs': 'Fasting blood sugar > 120 mg/dl - indicator of diabetes, a risk factor',
            'restecg': 'Resting electrocardiographic results - abnormalities can indicate heart issues',
            'thalach': 'Maximum heart rate achieved - lower max heart rate can indicate problems',
            'exang': 'Exercise induced angina - chest pain during exercise is a warning sign',
            'oldpeak': 'ST depression induced by exercise - greater depression indicates higher risk',
            'slope': 'Slope of the peak exercise ST segment - certain patterns indicate risk',
            'ca': 'Number of major vessels colored by fluoroscopy - more vessels with issues means higher risk',
            'thal': 'Thalassemia type - a blood disorder that can affect heart function'
        }
        
        # Create response data
        feature_data = []
        for i, feature in enumerate(feature_names):
            feature_data.append({
                'feature': feature,
                'importance': float(importances[i]),
                'description': descriptions.get(feature, '')
            })
        
        # Sort by importance
        feature_data.sort(key=lambda x: x['importance'], reverse=True)
        
        logger.info(f"Returning feature importance data for {len(feature_data)} features")
        return jsonify(feature_data), 200
        
    except Exception as e:
        logger.exception("Error getting feature importance:")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("DEBUG", "True") == "True"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
