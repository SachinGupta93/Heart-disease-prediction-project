import React, { useState } from "react";
import axios from "axios";
import "../styles/main.css";

const PredictionForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        age: "",
        sex: "",
        cp: "",
        trestbps: "",
        chol: "",
        fbs: "",
        restecg: "",
        thalach: "",
        exang: "",
        oldpeak: "",
        slope: "",
        ca: "",
        thal: ""
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Field descriptions for better user understanding
    const fieldDescriptions = {
        age: "Your age in years",
        sex: "0 = Female, 1 = Male",
        cp: "Chest pain type: 0 = Typical angina, 1 = Atypical angina, 2 = Non-anginal pain, 3 = Asymptomatic",
        trestbps: "Resting blood pressure in mm Hg",
        chol: "Serum cholesterol in mg/dl",
        fbs: "Fasting blood sugar > 120 mg/dl: 0 = False, 1 = True",
        restecg: "Resting ECG results: 0 = Normal, 1 = ST-T wave abnormality, 2 = Left ventricular hypertrophy",
        thalach: "Maximum heart rate achieved during exercise",
        exang: "Exercise induced angina: 0 = No, 1 = Yes",
        oldpeak: "ST depression induced by exercise relative to rest",
        slope: "Slope of peak exercise ST segment: 0 = Upsloping, 1 = Flat, 2 = Downsloping",
        ca: "Number of major vessels colored by fluoroscopy (0-3)",
        thal: "Thalassemia: 1 = Fixed defect, 2 = Normal, 3 = Reversible defect"
    };

    // Human-readable field labels
    const fieldLabels = {
        age: "Age",
        sex: "Gender",
        cp: "Chest Pain Type",
        trestbps: "Resting Blood Pressure",
        chol: "Cholesterol Level",
        fbs: "High Fasting Blood Sugar",
        restecg: "Resting ECG Results",
        thalach: "Max Heart Rate",
        exang: "Exercise Angina",
        oldpeak: "ST Depression",
        slope: "ST Segment Slope",
        ca: "Major Vessels Count",
        thal: "Thalassemia"
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // If this component is being used by a parent component that needs the form data
            if (onSubmit) {
                onSubmit(formData);
                return;
            }
            
            // Otherwise, make the API call directly
            const response = await axios.post("http://127.0.0.1:5000/predict", {
                age: parseFloat(formData.age),
                sex: parseFloat(formData.sex),
                cp: parseFloat(formData.cp),
                trestbps: parseFloat(formData.trestbps),
                chol: parseFloat(formData.chol),
                fbs: parseFloat(formData.fbs),
                restecg: parseFloat(formData.restecg),
                thalach: parseFloat(formData.thalach),
                exang: parseFloat(formData.exang),
                oldpeak: parseFloat(formData.oldpeak),
                slope: parseFloat(formData.slope),
                ca: parseFloat(formData.ca),
                thal: parseFloat(formData.thal)
            });
            
            setResult({
                prediction: response.data.prediction,
                probability: response.data.probability,
                message: response.data.message
            });
        } catch (error) {
            console.error("Error making prediction:", error);
            setError("An error occurred while making the prediction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render appropriate input for each field
    const renderInput = (name) => {
        // Special cases for fields with specific options
        if (name === "sex") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Gender</option>
                    <option value="0">Female</option>
                    <option value="1">Male</option>
                </select>
            );
        } else if (name === "cp") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Chest Pain Type</option>
                    <option value="0">Typical Angina</option>
                    <option value="1">Atypical Angina</option>
                    <option value="2">Non-anginal Pain</option>
                    <option value="3">Asymptomatic</option>
                </select>
            );
        } else if (name === "fbs") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Option</option>
                    <option value="0">No (≤ 120 mg/dl)</option>
                    <option value="1">Yes ( 120 mg/dl)</option>
                </select>
            );
        } else if (name === "restecg") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select ECG Result</option>
                    <option value="0">Normal</option>
                    <option value="1">ST-T Wave Abnormality</option>
                    <option value="2">Left Ventricular Hypertrophy</option>
                </select>
            );
        } else if (name === "exang") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Option</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </select>
            );
        } else if (name === "slope") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Slope Type</option>
                    <option value="0">Upsloping</option>
                    <option value="1">Flat</option>
                    <option value="2">Downsloping</option>
                </select>
            );
        } else if (name === "thal") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Thalassemia Type</option>
                    <option value="1">Fixed Defect</option>
                    <option value="2">Normal</option>
                    <option value="3">Reversible Defect</option>
                </select>
            );
        } else {
            // Default number input for other fields
            return (
                <input
                    type="number"
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    step={name === "oldpeak" ? "0.1" : "1"}
                    min="0"
                />
            );
        }
    };

    return (
        <div className="card prediction-form">
            <div className="form-intro">
                <h2>Heart Disease Risk Assessment</h2>
                <p>
                    Please enter your medical information below to assess your heart disease risk. 
                    All fields are required for an accurate prediction.
                </p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    {Object.keys(formData).map((key) => (
                        <div key={key} className="form-group">
                            <label htmlFor={key}>{fieldLabels[key]}</label>
                            <div className="field-description">{fieldDescriptions[key]}</div>
                            {renderInput(key)}
                        </div>
                    ))}
                </div>
                
                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Processing..." : "Assess My Risk"}
                    </button>
                </div>
            </form>
            
            {error && <div className="error-message">{error}</div>}
            
            {result && (
                <div className="result">
                    <h3>Assessment Results</h3>
                    <p className={result.prediction === 1 ? "positive" : "negative"}>
                        {result.message}
                    </p>
                    <p className="probability">
                        Risk Probability: {(result.probability * 100).toFixed(2)}%
                    </p>
                    <div className="recommendation">
                        <h4>What does this mean?</h4>
                        {result.prediction === 1 ? (
                            <p>
                                Your assessment indicates a higher risk of heart disease. This is not a diagnosis, 
                                but we recommend consulting with a healthcare professional for a thorough evaluation.
                            </p>
                        ) : (
                            <p>
                                Your assessment indicates a lower risk of heart disease. Continue maintaining a 
                                healthy lifestyle with regular exercise and a balanced diet. Remember to have 
                                regular check-ups with your healthcare provider.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionForm;
