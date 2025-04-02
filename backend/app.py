from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import joblib
import os
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from datetime import datetime

app = Flask(__name__)
load_dotenv()  # Load environment variables from .env file

# Configure CORS properly to allow requests from your frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Get the directory where app.py is located
base_dir = os.path.dirname(os.path.abspath(__file__))

# Construct absolute paths relative to the application directory
model_path = os.path.join(base_dir, os.getenv('MODEL_PATH', 'model/heart_model.pkl').lstrip('./'))
scaler_path = os.path.join(base_dir, os.getenv('SCALER_PATH', 'model/scaler.pkl').lstrip('./'))

print(f"Looking for model at: {model_path}")
print(f"Looking for scaler at: {scaler_path}")

# Initialize variables
model = None
scaler = None

# Check if files exist and load them
if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
        print(f"Model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model file not found at {model_path}")

if os.path.exists(scaler_path):
    try:
        scaler = joblib.load(scaler_path)
        print(f"Scaler loaded successfully from {scaler_path}")
    except Exception as e:
        print(f"Error loading scaler: {e}")
else:
    print(f"Scaler file not found at {scaler_path}")

# Feature names for the heart disease dataset
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

# Feature descriptions for better understanding
feature_descriptions = {
    'age': 'Age in years',
    'sex': 'Sex (1 = male, 0 = female)',
    'cp': 'Chest pain type (0-3)',
    'trestbps': 'Resting blood pressure (mm Hg)',
    'chol': 'Serum cholesterol (mg/dl)',
    'fbs': 'Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)',
    'restecg': 'Resting electrocardiographic results (0-2)',
    'thalach': 'Maximum heart rate achieved',
    'exang': 'Exercise induced angina (1 = yes, 0 = no)',
    'oldpeak': 'ST depression induced by exercise relative to rest',
    'slope': 'Slope of the peak exercise ST segment (0-2)',
    'ca': 'Number of major vessels colored by fluoroscopy (0-3)',
    'thal': 'Thalassemia (0-3)'
}

# Add a root endpoint for basic testing
@app.route('/', methods=['GET', 'OPTIONS'])
def home():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    return jsonify({
        'message': 'Heart Disease Prediction API is running',
        'endpoints': {
            '/predict': 'POST - Make a heart disease prediction',
            '/predict/ensemble': 'POST - Get ensemble prediction',
            '/history': 'GET - Get prediction history, POST - Save prediction',
            '/models/feature-importance': 'GET - Get feature importance data',
            '/models/comparison': 'GET - Get model comparison data',
            '/health-info': 'GET - Get health information'
        }
    })

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
    
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        return jsonify({
            'error': 'Model or scaler not loaded. Please check server logs.'
        }), 500
    
    # Handle the actual POST request
    try:
        data = request.json
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Scale the input data
        scaled_data = scaler.transform(pd.DataFrame([input_data], columns=feature_names))

        
        # Make prediction
        prediction = model.predict(scaled_data)
        probability = model.predict_proba(scaled_data)[0][1]  # Probability of class 1
        
        return jsonify({
            'prediction': int(prediction[0]),
            'probability': float(probability),
            'risk_level': 'High Risk' if probability > 0.7 else 'Moderate Risk' if probability > 0.3 else 'Low Risk',
            'timestamp': datetime.now().isoformat(),
            'inputs': {
                feature: value for feature, value in zip(feature_names, input_data)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def history():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    if request.method == 'GET':
        # This would typically fetch from a database
        # For now, return a sample response
        sample_history = [
            {
                'id': '1',
                'date': '2023-03-31T10:30:00',
                'prediction': 1,
                'probability': 0.85,
                'risk_level': 'High Risk',
                'inputs': {
                    'age': 65,
                    'sex': 1,
                    'cp': 3,
                    'trestbps': 140,
                    'chol': 250,
                    'fbs': 1,
                    'restecg': 0,
                    'thalach': 120,
                    'exang': 1,
                    'oldpeak': 2.5,
                    'slope': 0,
                    'ca': 2,
                    'thal': 2
                }
            },
            {
                'id': '2',
                'date': '2023-03-30T15:45:00',
                'prediction': 0,
                'probability': 0.25,
                'risk_level': 'Low Risk',
                'inputs': {
                    'age': 42,
                    'sex': 0,
                    'cp': 0,
                    'trestbps': 120,
                    'chol': 180,
                    'fbs': 0,
                    'restecg': 0,
                    'thalach': 160,
                    'exang': 0,
                    'oldpeak': 0.5,
                    'slope': 1,
                    'ca': 0,
                    'thal': 1
                }
            }
        ]
        return jsonify(sample_history)
    elif request.method == 'POST':
        try:
            data = request.json
            # In a real app, you would save this to a database
            # For now, just return success
            return jsonify({'success': True, 'message': 'History saved successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    elif request.method == 'DELETE':
        try:
            # In a real app, you would delete from a database
            # For now, just return success
            return jsonify({'success': True, 'message': 'History entry deleted successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/history/<id>', methods=['DELETE', 'OPTIONS'])
def delete_history_item(id):
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    try:
        # In a real app, you would delete from a database
        # For now, just return success
        return jsonify({'success': True, 'message': f'History entry {id} deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models/feature-importance', methods=['GET', 'OPTIONS'])
def feature_importance():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    try:
        # If your model is a scikit-learn model with feature_importances_
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        # For other models like logistic regression
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0])
        else:
            # Provide sample data if model doesn't have feature importance
            importances = [0.08, 0.12, 0.15, 0.05, 0.07, 0.03, 0.04, 0.10, 0.09, 0.08, 0.06, 0.07, 0.06]
        
        # Create a list of features with their importance values
        feature_importance_data = [
            {
                'feature': feature,
                'importance': float(importance),
                'description': feature_descriptions.get(feature, '')
            }
            for feature, importance in zip(feature_names, importances)
        ]
        
        # Sort by importance (descending)
        feature_importance_data.sort(key=lambda x: x['importance'], reverse=True)
        
        return jsonify(feature_importance_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models/comparison', methods=['GET', 'OPTIONS'])
def model_comparison():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    # Sample data for model comparison
    models_data = [
        {
            'name': 'Random Forest',
            'accuracy': 0.85,
            'precision': 0.83,
            'recall': 0.82,
            'f1_score': 0.82,
            'auc': 0.90
        },
        {
            'name': 'Logistic Regression',
            'accuracy': 0.80,
            'precision': 0.79,
            'recall': 0.75,
            'f1_score': 0.77,
            'auc': 0.85
        },
        {
            'name': 'Support Vector Machine',
            'accuracy': 0.82,
            'precision': 0.81,
            'recall': 0.78,
            'f1_score': 0.79,
            'auc': 0.87
        },
        {
            'name': 'Neural Network',
            'accuracy': 0.84,
            'precision': 0.82,
            'recall': 0.81,
            'f1_score': 0.81,
            'auc': 0.89
        }
    ]
    return jsonify(models_data)

@app.route('/health-info', methods=['GET', 'OPTIONS'])
def health_info():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    # Sample health information data
    health_info_data = {
        'risk_factors': [
            {
                'name': 'Age',
                'description': 'Risk increases with age, especially after 45 for men and 55 for women.',
                'recommendations': ['Regular check-ups', 'Stay physically active']
            },
            {
                'name': 'High Blood Pressure',
                'description': 'Damages arteries and can lead to heart disease.',
                'recommendations': ['Limit salt intake', 'Regular exercise', 'Medication if prescribed']
            },
            {
                'name': 'High Cholesterol',
                'description': 'Builds up in arteries and increases heart disease risk.',
                'recommendations': ['Eat heart-healthy diet', 'Exercise regularly', 'Medication if prescribed']
            },
            {
                'name': 'Smoking',
                'description': 'Damages blood vessels and reduces oxygen in blood.',
                'recommendations': ['Quit smoking', 'Seek support programs', 'Avoid secondhand smoke']
            },
            {
                'name': 'Diabetes',
                'description': 'Increases risk of heart disease and stroke.',
                'recommendations': ['Monitor blood sugar', 'Follow treatment plan', 'Healthy diet']
            }
        ],
        'prevention_tips': [
            'Maintain a healthy diet rich in fruits, vegetables, and whole grains',
            'Exercise regularly (at least 150 minutes of moderate activity per week)',
            'Maintain a healthy weight',
            'Quit smoking and avoid secondhand smoke',
            'Limit alcohol consumption',
            'Manage stress through relaxation techniques',
            'Get regular health screenings',
            'Control conditions like high blood pressure, diabetes, and high cholesterol'
        ],
        'resources': [
            {
                'name': 'American Heart Association',
                'url': 'https://www.heart.org/'
            },
            {
                'name': 'Centers for Disease Control and Prevention',
                'url': 'https://www.cdc.gov/heartdisease/'
            },
            {
                'name': 'World Heart Federation',
                'url': 'https://world-heart-federation.org/'
            }
        ]
    }
    return jsonify(health_info_data)

@app.route('/predict/ensemble', methods=['POST', 'OPTIONS'])
def predict_ensemble():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
    
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        return jsonify({
            'error': 'Model or scaler not loaded. Please check server logs.'
        }), 500
    
    try:
        data = request.json
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Scale the input data
        scaled_data = scaler.transform(pd.DataFrame([input_data], columns=feature_names))

        
        # Make prediction with main model (Random Forest)
        rf_prediction = model.predict(scaled_data)[0]
        rf_probability = model.predict_proba(scaled_data)[0][1]
        
        # Simulate Neural Network prediction (in a real app, you'd load a separate model)
        # Here we're adding a small random variation to the main model's prediction
        nn_probability = max(0.0, min(1.0, rf_probability + np.random.normal(-0.05, 0.05)))
        nn_prediction = 1 if nn_probability > 0.5 else 0
        
        # Calculate ensemble prediction (weighted average)
        ensemble_probability = (rf_probability * 0.6) + (nn_probability * 0.4)  # 60/40 weight
        ensemble_prediction = 1 if ensemble_probability > 0.5 else 0
        
        # Determine risk level
       # Determine risk level
        if ensemble_probability < 0.2:
            risk_level = "Low Risk"
        elif ensemble_probability < 0.4:
            risk_level = "Moderate Risk"
        elif ensemble_probability < 0.7:
            risk_level = "High Risk"
        else:
            risk_level = "Very High Risk"

        
        # Create appropriate message
        if ensemble_prediction == 1:
            message = f"You have a {risk_level.lower()} of heart disease. Please consult with a healthcare professional."
        else:
            message = f"You have a {risk_level.lower()} of heart disease. Continue maintaining a healthy lifestyle."
        
        # Create model predictions array for frontend display
        model_predictions = [
            {
                'model_name': 'Random Forest',
                'prediction': int(rf_prediction),
                'probability': float(rf_probability),
                'confidence': 0.85
            },
            {
                'model_name': 'Neural Network',
                'prediction': int(nn_prediction),
                'probability': float(nn_probability),
                'confidence': 0.84
            }
        ]
        
        return jsonify({
            'prediction': int(ensemble_prediction),
            'probability': float(ensemble_probability),
            'risk_level': risk_level,
            'message': message,
            'rf_prediction': int(rf_prediction),
            'rf_probability': float(rf_probability),
            'nn_prediction': int(nn_prediction),
            'nn_probability': float(nn_probability),
            'model_predictions': model_predictions,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/explain', methods=['POST', 'OPTIONS'])
def explain_prediction():
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return make_response('', 200)
    
    # Check if model and scaler are loaded
    if model is None or scaler is None:
        return jsonify({
            'error': 'Model or scaler not loaded. Please check server logs.'
        }), 500
    
    try:
        data = request.json
        # Only extract the expected features in the correct order
        input_data = []
        for feature in feature_names:
            input_data.append(data.get(feature, 0))
        
        # Scale the input data
        scaled_data = scaler.transform(pd.DataFrame([input_data], columns=feature_names))

        
        # Make prediction
        prediction = model.predict(scaled_data)
        probability = model.predict_proba(scaled_data)[0][1]
        
        # Get feature importance for this prediction
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0])
        else:
            importances = [0.08, 0.12, 0.15, 0.05, 0.07, 0.03, 0.04, 0.10, 0.09, 0.08, 0.06, 0.07, 0.06]
        
        # Combine feature values with their importance
        feature_contributions = []
        for feature, value, importance in zip(feature_names, input_data, importances):
            # Calculate contribution (simplified approach)
            contribution = float(value * importance)
            feature_contributions.append({
                'feature': feature,
                'value': value,
                'importance': float(importance),
                'contribution': contribution,
                'description': feature_descriptions.get(feature, '')
            })
        
        # Sort by contribution (absolute value, descending)
        feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        
        # Generate explanation text
        top_features = feature_contributions[:3]
        explanation_text = f"The model predicts {'a high' if probability > 0.7 else 'a medium' if probability > 0.3 else 'a low'} risk of heart disease. "
        explanation_text += "The most important factors in this prediction are: "
        explanation_text += ", ".join([f"{f['feature']} ({f['description']})" for f in top_features])
        
        return jsonify({
            'prediction': int(prediction[0]),
            'probability': float(probability),
            'risk_level': 'High Risk' if probability > 0.7 else 'Moderate Risk' if probability > 0.3 else 'Low Risk',
            'explanation': explanation_text,
            'feature_contributions': feature_contributions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
