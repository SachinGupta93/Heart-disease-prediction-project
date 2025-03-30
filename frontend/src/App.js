import React, { useState } from 'react';
import PredictionForm from './components/PredictionForm';
import ModelComparison from './components/ModelComparison';
import FeatureImportance from './components/FeatureImportance';
import HealthInformation from './components/HealthInformation';
import './styles/main.css';
import './styles/spinner.css';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Heart Disease Risk Assessment Tool</h1>
        <p>A user-friendly tool to help assess your heart health</p>
        <nav className="main-nav">
          <button 
            className={activeTab === 'predict' ? 'active' : ''} 
            onClick={() => setActiveTab('predict')}
            aria-label="Go to risk assessment form"
          >
            Risk Assessment
          </button>
          <button 
            className={activeTab === 'compare' ? 'active' : ''} 
            onClick={() => setActiveTab('compare')}
            aria-label="Go to model comparison"
          >
            Compare Models
          </button>
          <button 
            className={activeTab === 'features' ? 'active' : ''} 
            onClick={() => setActiveTab('features')}
            aria-label="Go to risk factors information"
          >
            Risk Factors
          </button>
          <button 
            className={activeTab === 'info' ? 'active' : ''} 
            onClick={() => setActiveTab('info')}
            aria-label="Go to health information"
          >
            Health Information
          </button>
        </nav>
      </header>
      
      <main className="App-main">
        {activeTab === 'predict' && <PredictionForm />}
        {activeTab === 'compare' && <ModelComparison />}
        {activeTab === 'features' && <FeatureImportance />}
        {activeTab === 'info' && <HealthInformation />}
      </main>
      
      <footer className="App-footer">
        <p>Heart Disease Risk Assessment Tool - Developed for patient education and screening</p>
        <p><small>Disclaimer: This tool provides an estimate only and is not a substitute for professional medical advice.</small></p>
      </footer>
    </div>
  );
}

export default App;
