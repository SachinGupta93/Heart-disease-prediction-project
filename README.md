Heart Disease Prediction
# Heart Disease Risk Assessment Tool

A web application that uses machine learning to predict heart disease risk based on clinical parameters.

## Features

- Heart disease risk prediction using Random Forest model
- Model comparison between Random Forest and Neural Network
- Feature importance visualization
- User-friendly interface for entering health data
- Detailed explanations of prediction results

## Project Structure

```
heart-disease-prediction/
├── backend/
│   ├── app.py                  # Flask API
│   ├── config.py               # Configuration settings
│   ├── data_processor.py       # Data preprocessing module
│   ├── model_trainer.py        # Model training module
│   ├── train.py                # Main training script
│   ├── model/                  # Saved models directory
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.js
│   │   │   ├── ModelComparison.js
│   │   │   └── FeatureImportance.js
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── dataset/
    └── heart.csv               # Heart disease dataset
```

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Train the models:
   ```
   python train.py
   ```

5. Start the Flask API:
   ```
   python app.py
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and go to http://localhost:3000

## Dataset

This project uses the UCI Heart Disease dataset, which includes various patient attributes like age, sex, chest pain type, blood pressure, cholesterol, and other medical measurements.

## Models

- **Random Forest**: An ensemble learning method that operates by constructing multiple decision trees during training.
- **Neural Network**: A deep learning model with multiple layers designed to recognize patterns in complex data.

## Disclaimer

This tool is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for medical concerns.

## License

MIT
