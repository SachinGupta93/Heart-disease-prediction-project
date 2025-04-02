import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

// Function to get prediction from the ensemble model
export const getEnsemblePrediction = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict/ensemble`, data);
    return {
      prediction: response.data.prediction,
      probability: response.data.probability,
      message: response.data.message,
      risk_level: response.data.risk_level
    };
  } catch (error) {
    console.error('Error getting ensemble prediction:', error);
    throw error;
  }
};

// Function to get explanation for a prediction
export const getPredictionExplanation = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict/explain`, data);
    return response.data;
  } catch (error) {
    console.error('Error getting prediction explanation:', error);
    throw error;
  }
};

// Function to get feature importance data
export const getFeatureImportance = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/models/feature-importance`);
    return response.data;
  } catch (error) {
    console.error('Error getting feature importance:', error);
    throw error;
  }
};

// Function to get model comparison data
export const getModelComparison = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/models/comparison`);
    return response.data;
  } catch (error) {
    console.error('Error getting model comparison:', error);
    throw error;
  }
};

// Function to get health information
export const getHealthInformation = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health-info`);
    return response.data;
  } catch (error) {
    console.error('Error getting health information:', error);
    throw error;
  }
};

// Function to get prediction history
export const getPredictionHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
  } catch (error) {
    console.error('Error getting prediction history:', error);
    throw error;
  }
};

// Function to save prediction to history
export const savePredictionToHistory = async (predictionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/history`, predictionData);
    return response.data;
  } catch (error) {
    console.error('Error saving prediction to history:', error);
    throw error;
  }
};

// Function to delete a prediction from history
export const deletePredictionFromHistory = async (predictionId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/history/${predictionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting prediction from history:', error);
    throw error;
  }
};

export default {
  getEnsemblePrediction,
  getPredictionExplanation,
  getFeatureImportance,
  getModelComparison,
  getHealthInformation,
  getPredictionHistory,
  savePredictionToHistory,
  deletePredictionFromHistory
};

