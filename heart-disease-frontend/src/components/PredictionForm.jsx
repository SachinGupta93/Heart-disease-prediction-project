import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/PredictionForm.module.css';
import {
    Box, Button, FormControl, FormLabel, Input, Select,
    VStack, Heading, Text, useToast, Spinner,
    Alert, AlertIcon, AlertTitle, AlertDescription, FormErrorMessage
} from '@chakra-ui/react';

const PredictionForm = ({ onPredictionUpdate }) => {
    const [formData, setFormData] = useState({
        age: '',
        sex: '1',
        cp: '0',
        trestbps: '',
        chol: '',
        fbs: '0',
        restecg: '0',
        thalach: '',
        exang: '0',
        oldpeak: '',
        slope: '0',
        ca: '0',
        thal: '0'
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        
        // Check if age is valid before proceeding
        if (formData.age === '' || isNaN(parseFloat(formData.age))) {
            setError("Please enter a valid age");
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            // Use the ensemble endpoint for predictions
            const response = await axios.post("http://127.0.0.1:5000/predict/ensemble", {
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

            const predictionResult = {
                prediction: response.data.prediction,
                probability: response.data.probability,
                message: response.data.message,
                input_data: formData
            };

            setResult(predictionResult);
            
            // Pass the prediction data to the parent component if the callback exists
            if (onPredictionUpdate) {
                onPredictionUpdate(predictionResult);
            }

            toast({
                title: 'Prediction Complete',
                description: 'Your heart disease risk prediction has been calculated.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error making prediction:", error);
            if (error.response && error.response.data) {
                setError(`Error: ${error.response.data.error || "Unknown error"}`);
            } else {
                setError("An error occurred while making the prediction. Please try again.");
            }

            toast({
                title: 'Error',
                description: 'There was an error making the prediction.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white" className={styles.predictionForm}>
            <Heading mb={4} size="lg" className={styles.formHeading}>Heart Disease Prediction</Heading>
            <Text mb={4}>Enter your health information to predict heart disease risk.</Text>

            {error && (
                <Alert status="error" mb={4} className={styles.errorAlert}>
                    <AlertIcon />
                    <AlertTitle mr={2}>Error!</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="flex-start">
                    <FormControl isRequired isInvalid={formData.age === '' && formSubmitted} className={styles.inputField}>
                        <FormLabel>Age</FormLabel>
                        <Input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Enter your age"
                            min="18"
                            max="120"
                        />
                        <FormErrorMessage>Age is required</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Sex</FormLabel>
                        <Select name="sex" value={formData.sex} onChange={handleChange}>
                            <option value="1">Male</option>
                            <option value="0">Female</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Chest Pain Type</FormLabel>
                        <Select name="cp" value={formData.cp} onChange={handleChange}>
                            <option value="0">Typical Angina</option>
                            <option value="1">Atypical Angina</option>
                            <option value="2">Non-anginal Pain</option>
                            <option value="3">Asymptomatic</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Resting Blood Pressure (mm Hg)</FormLabel>
                        <Input
                            type="number"
                            name="trestbps"
                            value={formData.trestbps}
                            onChange={handleChange}
                            placeholder="Enter resting blood pressure"
                        />
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Serum Cholesterol (mg/dl)</FormLabel>
                        <Input
                            type="number"
                            name="chol"
                            value={formData.chol}
                            onChange={handleChange}
                            placeholder="Enter cholesterol level"
                        />
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Fasting Blood Sugar {'>'} 120 mg/dl</FormLabel>
                        <Select name="fbs" value={formData.fbs} onChange={handleChange}>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Resting Electrocardiographic Results</FormLabel>
                        <Select name="restecg" value={formData.restecg} onChange={handleChange}>
                            <option value="0">Normal</option>
                            <option value="1">ST-T Wave Abnormality</option>
                            <option value="2">Left Ventricular Hypertrophy</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Maximum Heart Rate Achieved</FormLabel>
                        <Input
                            type="number"
                            name="thalach"
                            value={formData.thalach}
                            onChange={handleChange}
                            placeholder="Enter maximum heart rate"
                        />
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Exercise Induced Angina</FormLabel>
                        <Select name="exang" value={formData.exang} onChange={handleChange}>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>ST Depression Induced by Exercise</FormLabel>
                        <Input
                            type="number"
                            name="oldpeak"
                            value={formData.oldpeak}
                            onChange={handleChange}
                            placeholder="Enter ST depression value"
                            step="0.1"
                        />
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Slope of the Peak Exercise ST Segment</FormLabel>
                        <Select name="slope" value={formData.slope} onChange={handleChange}>
                            <option value="0">Upsloping</option>
                            <option value="1">Flat</option>
                            <option value="2">Downsloping</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Number of Major Vessels Colored by Fluoroscopy</FormLabel>
                        <Select name="ca" value={formData.ca} onChange={handleChange}>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired className={styles.inputField}>
                        <FormLabel>Thalassemia</FormLabel>
                        <Select name="thal" value={formData.thal} onChange={handleChange}>
                            <option value="0">Normal</option>
                            <option value="1">Fixed Defect</option>
                            <option value="2">Reversible Defect</option>
                            <option value="3">Unknown</option>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="blue"
                        width="full"
                        isLoading={loading}
                        loadingText="Predicting..."
                        className={styles.submitButton}
                    >
                        Predict
                    </Button>
                </VStack>
            </form>

            {loading && (
                <Box textAlign="center" mt={4} className={styles.loadingContainer}>
                    <Spinner size="xl" className={styles.spinner} />
                    <Text mt={2}>Analyzing your data...</Text>
                </Box>
            )}

            {result && !loading && (
                <Box 
                    mt={4} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    className={`${styles.resultBox} ${result.prediction === 1 ? styles.highRisk : styles.lowRisk}`}
                >
                    <Heading size="md" mb={2} className={styles.resultHeading}>
                        {result.prediction === 1 ? "High Risk Detected" : "Low Risk Detected"}
                    </Heading>
                    <Text className={styles.resultMessage}>
                        {result.message}
                    </Text>
                    <Text mt={2} fontWeight="bold" className={styles.probabilityText}>
                        Probability: {(result.probability * 100).toFixed(2)}%
                    </Text>
                    <Text mt={2} fontSize="sm" className={styles.modelInfo}>
                        This prediction is based on an ensemble of machine learning models.
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default PredictionForm;
