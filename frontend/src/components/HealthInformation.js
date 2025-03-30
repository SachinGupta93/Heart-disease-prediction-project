import React from 'react';
import '../styles/main.css';

const HealthInformation = () => {
  return (
    <div className="card health-information">
      <h2>Understanding Heart Disease</h2>
      
      <div className="info-section">
        <h3>What is Heart Disease?</h3>
        <p>
          Heart disease refers to several types of heart conditions. The most common type is coronary artery disease, 
          which affects blood flow to the heart and can lead to a heart attack. Other conditions affect your heart's 
          muscle, valves, or rhythm.
        </p>
      </div>
      
      <div className="info-section">
        <h3>Common Risk Factors</h3>
        <ul>
          <li><strong>Age:</strong> Risk increases with age, especially after 45 for men and 55 for women</li>
          <li><strong>Family History:</strong> Heart disease often runs in families</li>
          <li><strong>High Blood Pressure:</strong> Forces your heart to work harder, thickening heart muscle</li>
          <li><strong>High Cholesterol:</strong> Can lead to plaque buildup in arteries</li>
          <li><strong>Smoking:</strong> Damages blood vessels and reduces oxygen in blood</li>
          <li><strong>Diabetes:</strong> Increases risk of heart disease significantly</li>
          <li><strong>Obesity:</strong> Associated with higher blood pressure, diabetes risk, and cholesterol</li>
          <li><strong>Physical Inactivity:</strong> Contributes to obesity and weakens the heart</li>
          <li><strong>Stress:</strong> May contribute to high blood pressure and other risk factors</li>
        </ul>
      </div>
      
      <div className="info-section">
        <h3>Warning Signs</h3>
        <p>Seek immediate medical attention if you experience:</p>
        <ul>
          <li>Chest pain or discomfort</li>
          <li>Upper body pain (arms, back, neck, jaw, or stomach)</li>
          <li>Shortness of breath</li>
          <li>Nausea, lightheadedness, or cold sweats</li>
          <li>Extreme fatigue</li>
        </ul>
        <p className="warning-note">
          <strong>Note:</strong> Women may experience different symptoms than men, such as fatigue, 
          nausea, and back or jaw pain without chest discomfort.
        </p>
      </div>
      
      <div className="info-section">
        <h3>Prevention Tips</h3>
        <ul>
          <li>Get regular check-ups to monitor blood pressure, cholesterol, and blood sugar</li>
          <li>Eat a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins</li>
          <li>Exercise regularly - aim for at least 150 minutes of moderate activity per week</li>
          <li>Maintain a healthy weight</li>
          <li>Quit smoking and avoid secondhand smoke</li>
          <li>Limit alcohol consumption</li>
          <li>Manage stress through relaxation techniques, meditation, or yoga</li>
          <li>Get adequate sleep - aim for 7-8 hours per night</li>
        </ul>
      </div>
      
      <div className="disclaimer">
        <h3>Important Disclaimer</h3>
        <p>
          This risk assessment tool provides an estimate based on statistical models and is not a substitute 
          for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare 
          provider about your specific health concerns.
        </p>
      </div>
    </div>
  );
};

export default HealthInformation;
