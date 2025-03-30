import React, { useState } from "react";
import axios from "axios";

const PredictionForm = () => {
    // Field labels and descriptions for better UI
    const fieldLabels = {
        age: "Age",
        sex: "Sex",
        cp: "Chest Pain Type",
        trestbps: "Resting Blood Pressure",
        chol: "Cholesterol",
        fbs: "Fasting Blood Sugar",
        restecg: "Resting ECG Results",
        thalach: "Maximum Heart Rate",
        exang: "Exercise Induced Angina",
        oldpeak: "ST Depression",
        slope: "ST Segment Slope",
        ca: "Number of Major Vessels",
        thal: "Thalassemia"
    };

    const fieldDescriptions = {
        age: "Age in years",
        sex: "Gender (0 = female, 1 = male)",
        cp: "Type of chest pain (0-3)",
        trestbps: "Resting blood pressure in mm Hg",
        chol: "Serum cholesterol in mg/dl",
        fbs: "Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)",
        restecg: "Resting electrocardiographic results (0-2)",
        thalach: "Maximum heart rate achieved",
        exang: "Exercise induced angina (1 = yes, 0 = no)",
        oldpeak: "ST depression induced by exercise relative to rest",
        slope: "Slope of the peak exercise ST segment (0-2)",
        ca: "Number of major vessels colored by fluoroscopy (0-3)",
        thal: "Thalassemia type (1-3)"
    };

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Use the new predictions endpoint
            const response = await axios.post("http://127.0.0.1:5000/predictions/", {
                age: parseFloat(formData.age),
                sex: parseInt(formData.sex),
                cp: parseInt(formData.cp),
                trestbps: parseFloat(formData.trestbps),
                chol: parseFloat(formData.chol),
                fbs: parseInt(formData.fbs),
                restecg: parseInt(formData.restecg),
                thalach: parseFloat(formData.thalach),
                exang: parseInt(formData.exang),
                oldpeak: parseFloat(formData.oldpeak),
                slope: parseInt(formData.slope),
                ca: parseInt(formData.ca),
                thal: parseInt(formData.thal)
            });
            
            setResult({
                prediction: response.data.prediction,
                probability: response.data.probability,
                message: response.data.message
            });
        } catch (error) {
            console.error("Error making prediction:", error);
            if (error.response && error.response.data && error.response.data.details) {
                // Show detailed validation errors if available
                setError(`Error: ${error.response.data.details.join(", ")}`);
            } else {
                setError("An error occurred while making the prediction. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (name) => {
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
                    <option value="1">Yes ({'>'} 120 mg/dl)</option>
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
        }else if (name === "ca") {
            return (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Number of Major Vessels</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            );
        }
        else {
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
        <div className="prediction-form">
            <h2>Heart Disease Prediction</h2>
            <p className="intro-text">
                Enter your health information below to get a prediction of your heart disease risk.
                This tool uses a Random Forest machine learning model trained on clinical data.
            </p>
            
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
                <button type="submit" disabled={loading}>
                    {loading ? "Predicting..." : "Predict"}
                </button>
            </form>
            
            {error && <div className="error-message">{error}</div>}
            
            {result && (
                <div className="result">
                    <h3>Prediction Result</h3>
                    <p className={result.prediction === 1 ? "positive" : "negative"}>
                        {result.message}
                    </p>
                    <p>Probability: {(result.probability * 100).toFixed(2)}%</p>
                    
                    <div className="result-explanation">
                        <h4>What does this mean?</h4>
                        {result.prediction === 1 ? (
                            <p>
                                The model predicts a higher risk of heart disease based on the information provided.
                                This is not a diagnosis, but suggests you should consider consulting with a healthcare
                                professional for further evaluation.
                            </p>
                        ) : (
                            <p>
                                The model predicts a lower risk of heart disease based on the information provided.
                                Continue maintaining a healthy lifestyle and regular check-ups with your healthcare provider.
                            </p>
                        )}
                        <p>
                            <small>
                                Remember: This is a prediction tool and not a substitute for professional medical advice.
                                Always consult with a healthcare provider for proper diagnosis and treatment.
                            </small>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionForm;
