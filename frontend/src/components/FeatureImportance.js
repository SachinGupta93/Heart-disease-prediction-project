import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "../styles/main.css";

const FeatureImportance = () => {
    const [featureData, setFeatureData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      // Update the fetchFeatureImportance function in FeatureImportance.js

const fetchFeatureImportance = async () => {
    try {
        // Use the real endpoint instead of mock data
        const response = await axios.get("http://127.0.0.1:5000/feature-importance");
        setFeatureData(response.data);
    } catch (error) {
        console.error("Error fetching feature importance:", error);
        setError("Failed to load feature importance data. Please try again later.");
        
        // Fallback to mock data if the endpoint fails
        const mockData = [
            { feature: "cp", importance: 0.18, description: "Type of chest pain experienced" },
            { feature: "thalach", importance: 0.16, description: "Maximum heart rate achieved during exercise" },
            { feature: "ca", importance: 0.15, description: "Number of major vessels colored by fluoroscopy" },
            { feature: "oldpeak", importance: 0.12, description: "ST depression induced by exercise relative to rest" },
            { feature: "thal", importance: 0.11, description: "Results from thallium stress test" },
            { feature: "exang", importance: 0.08, description: "Exercise induced angina (chest pain)" },
            { feature: "age", importance: 0.06, description: "Age in years" },
            { feature: "sex", importance: 0.05, description: "Biological sex (male/female)" },
            { feature: "slope", importance: 0.04, description: "Slope of the peak exercise ST segment" },
            { feature: "restecg", importance: 0.03, description: "Resting electrocardiographic results" },
            { feature: "chol", importance: 0.02, description: "Serum cholesterol in mg/dl" },
            { feature: "trestbps", importance: 0.01, description: "Resting blood pressure (mm Hg)" },
            { feature: "fbs", importance: 0.01, description: "Fasting blood sugar > 120 mg/dl" }
        ];
        
        setFeatureData(mockData);
    } finally {
        setLoading(false);
    }
};


        fetchFeatureImportance();
    }, []);

    // Function to get human-readable feature names
    const getReadableFeatureName = (feature) => {
        const featureNames = {
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
        
        return featureNames[feature] || feature;
    };

    // Prepare data for chart with readable names
    const chartData = featureData.map(item => ({
        ...item,
        name: getReadableFeatureName(item.feature),
        importancePercent: (item.importance * 100).toFixed(1)
    }));

    return (
        <div className="card">
            <div className="feature-importance">
                <h2>Risk Factors Analysis</h2>
                <p className="intro-text">
                    This visualization shows the relative importance of different factors in predicting heart disease risk.
                    Factors with higher importance have a stronger influence on the prediction model's decision.
                </p>

                {loading ? (
                    <div className="loading-message">Loading risk factors data...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 20]} tickFormatter={(value) => `${value}%`} />
                                    <YAxis dataKey="name" type="category" width={140} />
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Importance']}
                                        labelFormatter={(value) => `Factor: ${value}`}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="importancePercent" 
                                        name="Importance (%)" 
                                        fill="#4A90E2" 
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="factors-explanation">
                            <h3>Understanding Heart Disease Risk Factors</h3>
                            <p>
                                The chart above shows which factors our model considers most important when 
                                assessing heart disease risk. Here's what you should know about the top factors:
                            </p>
                            
                            <div className="factors-grid">
                                {chartData.slice(0, 5).map((item, index) => (
                                    <div key={index} className="factor-card">
                                        <h4>{item.name}</h4>
                                        <p className="factor-importance">Importance: {item.importancePercent}%</p>
                                        <p>{item.description}</p>
                                        <div className="factor-advice">
                                            {item.feature === "cp" && (
                                                <p>If you experience chest pain, especially during physical activity, consult a doctor promptly.</p>
                                            )}
                                            {item.feature === "thalach" && (
                                                <p>Regular exercise can help improve your maximum heart rate capacity over time.</p>
                                            )}
                                            {item.feature === "ca" && (
                                                <p>The number of major vessels with blockage is a significant indicator of heart disease risk.</p>
                                            )}
                                            {item.feature === "oldpeak" && (
                                                <p>ST depression on an ECG can indicate reduced blood flow to the heart muscle.</p>
                                            )}
                                            {item.feature === "thal" && (
                                                <p>Thalassemia results can reveal how well your heart receives blood flow.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="modifiable-factors">
                                <h3>Factors You Can Control</h3>
                                <p>
                                    While some risk factors like age and family history cannot be changed, 
                                    many important factors are within your control:
                                </p>
                                <ul>
                                    <li>
                                        <strong>Cholesterol Levels:</strong> Maintain healthy cholesterol through diet, 
                                        exercise, and medication if prescribed.
                                    </li>
                                    <li>
                                        <strong>Blood Pressure:</strong> Regular monitoring and management through 
                                        lifestyle changes and medication when needed.
                                    </li>
                                    <li>
                                        <strong>Blood Sugar:</strong> Maintain healthy blood sugar levels through 
                                        diet, exercise, and proper diabetes management if applicable.
                                    </li>
                                    <li>
                                        <strong>Physical Activity:</strong> Regular exercise improves heart health 
                                        and can positively impact many risk factors.
                                    </li>
                                    <li>
                                        <strong>Smoking:</strong> Quitting smoking can significantly reduce your 
                                        heart disease risk.
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="next-steps">
                                <h3>Recommended Next Steps</h3>
                                <p>
                                    Based on this information, consider these actions to manage your heart health:
                                </p>
                                <ol>
                                    <li>Discuss these risk factors with your healthcare provider</li>
                                    <li>Get regular check-ups to monitor your heart health</li>
                                    <li>Make lifestyle changes to address modifiable risk factors</li>
                                    <li>Learn to recognize warning signs of heart problems</li>
                                    <li>Consider a comprehensive cardiac evaluation if you have multiple risk factors</li>
                                </ol>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeatureImportance;
