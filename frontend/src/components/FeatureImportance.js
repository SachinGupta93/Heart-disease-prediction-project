import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FeatureImportance = () => {
    const [featureImportance, setFeatureImportance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeatureImportance = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/models/feature-importance");
                
                // Sort features by importance (descending)
                const sortedFeatures = response.data.sort((a, b) => b.importance - a.importance);
                
                setFeatureImportance(sortedFeatures);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching feature importance:", error);
                setError("Failed to load feature importance data. Please try again later.");
                setLoading(false);
            }
        };

        fetchFeatureImportance();
    }, []);

    // Function to get a color based on importance value
    const getImportanceColor = (importance) => {
        // Convert importance to a percentage (assuming max is around 0.3)
        const percentage = Math.min(importance * 3.33, 1);
        
        // Generate a color from red (low importance) to green (high importance)
        const r = Math.floor(255 * (1 - percentage));
        const g = Math.floor(255 * percentage);
        const b = 0;
        
        return `rgb(${r}, ${g}, ${b})`;
    };

    // Prepare data for Recharts
    const prepareChartData = () => {
        return featureImportance.map(feature => ({
            name: feature.feature,
            importance: parseFloat((feature.importance * 100).toFixed(2)),
            fill: getImportanceColor(feature.importance),
            description: feature.description
        }));
    };

    if (loading) {
        return <div className="loading">Loading feature importance data...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="feature-importance-container">
            <h2>Feature Importance Analysis</h2>
            <p className="intro-text">
                This chart shows which health factors have the most significant impact on heart disease prediction
                according to our Random Forest model. Longer bars indicate more influential factors.
            </p>
            
            {/* Recharts Bar Chart */}
            <div className="feature-importance-chart-container">
                <h3>Feature Importance Chart</h3>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={prepareChartData()}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" label={{ value: 'Importance (%)', position: 'insideBottom', offset: -5 }} />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 14 }}
                        />
                        <Tooltip 
                            formatter={(value) => [`${value}%`, 'Importance']}
                            labelFormatter={(label) => `Feature: ${label}`}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="custom-tooltip">
                                            <p className="label"><strong>{label}</strong></p>
                                            <p className="value">Importance: {data.importance}%</p>
                                            <p className="desc">{data.description}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar 
                            dataKey="importance" 
                            name="Importance (%)" 
                            fill="#8884d8"
                            // Use the custom color for each bar
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Keep the original visualization as well */}
            <div className="feature-importance-original">
                <h3>Detailed Feature Breakdown</h3>
                <div className="feature-importance-chart">
                    {featureImportance.map((feature, index) => (
                        <div key={index} className="feature-item">
                            <div className="feature-name">
                                <span title={feature.description}>{feature.feature}</span>
                            </div>
                            <div className="feature-bar-container">
                                <div 
                                    className="feature-bar" 
                                    style={{ 
                                        width: `${Math.min(feature.importance * 300, 100)}%`,
                                        backgroundColor: getImportanceColor(feature.importance)
                                    }}
                                ></div>
                                <span className="feature-value">
                                    {(feature.importance * 100).toFixed(2)}%
                                </span>
                            </div>
                            <div className="feature-description">
                                {feature.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="feature-importance-explanation">
                <h3>Understanding Feature Importance</h3>
                <p>
                    Feature importance helps us understand which factors are most predictive of heart disease.
                    In machine learning, this is calculated by measuring how much each feature contributes to 
                    the model's accuracy.
                </p>
                <p>
                    <strong>What this means for you:</strong> Pay special attention to the factors at the top
                    of this list when considering your heart health. These are the variables that most strongly
                    correlate with heart disease risk according to our model.
                </p>
                <p>
                    <strong>Note:</strong> Feature importance doesn't necessarily indicate causation. Some
                    factors may be important for prediction but might not directly cause heart disease.
                    Always consult with healthcare professionals for medical advice.
                </p>
            </div>
        </div>
    );
};

export default FeatureImportance;
