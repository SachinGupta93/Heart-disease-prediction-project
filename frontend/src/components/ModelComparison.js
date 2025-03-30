import React, { useState } from "react";
import axios from "axios";

const ModelComparison = () => {
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

    const [comparisonResult, setComparisonResult] = useState(null);
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
            // Use the new compare endpoint
            const response = await axios.post("http://127.0.0.1:5000/predictions/compare", {
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

            setComparisonResult(response.data);
        } catch (error) {
            console.error("Error comparing models:", error);
            if (error.response && error.response.data && error.response.data.details) {
                // Show detailed validation errors if available
                setError(`Error: ${error.response.data.details.join(", ")}`);
            } else {
                setError("An error occurred while comparing models. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (name) => {
        if (name === "sex") {
            return (
                <select
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
                    id={`comp-${name}`}
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
        <div className="card">
            <div className="form-intro">
                <h2>Compare Different Models</h2>
                <p>
                    This tool compares predictions from two different machine learning models:
                    a Random Forest model and a Neural Network model. Comparing results from
                    multiple models can provide more confidence in the assessment.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    {Object.keys(formData).map((key) => (
                        <div key={key} className="form-group">
                            <label htmlFor={`comp-${key}`}>{fieldLabels[key]}</label>
                            <div className="field-description">{fieldDescriptions[key]}</div>
                            {renderInput(key)}
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Comparing Models..." : "Compare Models"}
                    </button>
                </div>
            </form>

            {error && <div className="error-message">{error}</div>}

            {comparisonResult && (
                <div className="comparison-results">
                    <h3>Model Comparison Results</h3>

                    <div className="comparison-grid">
                        <div className="model-card">
                            <h4>Random Forest Model</h4>
                            <p className={comparisonResult.random_forest.prediction === 1 ? "positive" : "negative"}>
                                {comparisonResult.random_forest.message}
                            </p>
                            <p>Risk Probability: {(comparisonResult.random_forest.probability * 100).toFixed(2)}%</p>
                            <p>
                                <small>
                                    Random Forest models are good at handling different types of data and 
                                    can provide insights into which factors are most important.
                                </small>
                            </p>
                        </div>
                        
                        <div className="model-card">
                            <h4>Neural Network Model</h4>
                            <p className={comparisonResult.neural_network.prediction === 1 ? "positive" : "negative"}>
                                {comparisonResult.neural_network.message}
                            </p>
                            <p>Risk Probability: {(comparisonResult.neural_network.probability * 100).toFixed(2)}%</p>
                            <p>
                                <small>
                                    Neural Network models can detect complex patterns in data and often 
                                    provide high accuracy in medical predictions.
                                </small>
                            </p>
                        </div>
                    </div>

                    <div className="agreement-indicator">
                        <h4>Model Agreement</h4>
                        <p className={comparisonResult.agreement ? "agreement" : "disagreement"}>
                            {comparisonResult.agreement 
                                ? "Both models agree on the prediction, which increases confidence in the result." 
                                : "Models disagree on the prediction. This suggests your case may be borderline and warrants professional medical consultation."}
                        </p>
                        
                        <div className="recommendation">
                            <h4>What should I do next?</h4>
                            {comparisonResult.agreement && comparisonResult.random_forest.prediction === 1 ? (
                                <p>
                                    Both models indicate a higher risk of heart disease. We strongly recommend 
                                    consulting with a healthcare professional for a thorough evaluation and 
                                    appropriate medical advice.
                                </p>
                            ) : comparisonResult.agreement && comparisonResult.random_forest.prediction === 0 ? (
                                <p>
                                    Both models indicate a lower risk of heart disease. Continue maintaining a 
                                    healthy lifestyle with regular exercise and a balanced diet. Remember to have 
                                    regular check-ups with your healthcare provider.
                                </p>
                            ) : (
                                <p>
                                    The models show different predictions, which may indicate that your case falls 
                                    in a borderline area. As a precaution, we recommend discussing these results 
                                    with a healthcare professional who can provide personalized advice.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelComparison;
