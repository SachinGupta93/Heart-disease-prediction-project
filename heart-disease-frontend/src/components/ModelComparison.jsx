import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ModelComparison.module.css';
import { 
    Box, Button, FormControl, FormLabel, Input, Select, 
    VStack, Heading, Text, useToast, Spinner, 
    Alert, AlertIcon, AlertTitle, AlertDescription,
    SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
    Badge, Flex, Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const ModelComparison = () => {
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
    const [comparisonResult, setComparisonResult] = useState(null);
    const [error, setError] = useState(null);
    const [modelPerformance, setModelPerformance] = useState([]);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const toast = useToast();

    // Fetch model performance data on component mount
    useEffect(() => {
        fetchModelPerformance();
    }, []);

    const fetchModelPerformance = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/models/comparison');
            setModelPerformance(response.data);
            setLoadingPerformance(false);
        } catch (error) {
            console.error('Error fetching model performance:', error);
            setLoadingPerformance(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Use the ensemble endpoint
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

            // Adapt the response to match the expected format
            setComparisonResult({
                random_forest: {
                    prediction: response.data.rf_prediction,
                    probability: response.data.rf_probability,
                    message: response.data.rf_prediction === 1 ? 
                        "High risk of heart disease detected." : 
                        "Low risk of heart disease detected."
                },
                neural_network: {
                    prediction: response.data.nn_prediction,
                    probability: response.data.nn_probability,
                    message: response.data.nn_prediction === 1 ? 
                        "High risk of heart disease detected." : 
                        "Low risk of heart disease detected."
                },
                ensemble: {
                    prediction: response.data.prediction,
                    probability: response.data.probability,
                    message: response.data.message
                },
                agreement: response.data.rf_prediction === response.data.nn_prediction
            });

            toast({
                title: 'Comparison Complete',
                description: 'Model comparison has been completed.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error comparing models:", error);
            if (error.response && error.response.data) {
                setError(`Error: ${error.response.data.error || "Unknown error"}`);
            } else {
                setError("An error occurred while comparing models. Please try again.");
            }

            toast({
                title: 'Error',
                description: 'There was an error comparing the models.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Render model performance metrics
    const renderModelPerformance = () => {
        if (loadingPerformance) {
            return (
                <Box textAlign="center" my={6}>
                    <Spinner size="md" />
                    <Text mt={2}>Loading model performance data...</Text>
                </Box>
            );
        }

        return (
            <Box className={styles.performanceContainer}>
                <Heading size="md" mb={4}>Model Performance Metrics</Heading>
                <Text mb={4}>
                    Compare the performance of different machine learning models used for heart disease prediction.
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    {modelPerformance.map((model, index) => (
                        <Box 
                            key={index} 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="md" 
                            bg="white"
                            className={styles.modelCard}
                        >
                            <Heading size="sm" mb={3}>{model.name}</Heading>
                            
                            <VStack spacing={2} align="stretch">
                                <Flex justify="space-between">
                                    <Text fontSize="sm">Accuracy:</Text>
                                    <Badge colorScheme="blue">{(model.accuracy * 100).toFixed(1)}%</Badge>
                                </Flex>
                                
                                <Flex justify="space-between">
                                    <Text fontSize="sm">Precision:</Text>
                                    <Badge colorScheme="green">{(model.precision * 100).toFixed(1)}%</Badge>
                                </Flex>
                                
                                <Flex justify="space-between">
                                    <Text fontSize="sm">Recall:</Text>
                                    <Badge colorScheme="purple">{(model.recall * 100).toFixed(1)}%</Badge>
                                </Flex>
                                
                                <Flex justify="space-between">
                                    <Text fontSize="sm">F1 Score:</Text>
                                    <Badge colorScheme="orange">{(model.f1_score * 100).toFixed(1)}%</Badge>
                                </Flex>
                                
                                <Flex justify="space-between">
                                    <Text fontSize="sm">AUC:</Text>
                                    <Badge colorScheme="cyan">{(model.auc * 100).toFixed(1)}%</Badge>
                                </Flex>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
        );
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white" className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Heading mb={4} size="lg" className={styles.heading}>Model Comparison</Heading>
                <Text mb={4}>
                    Compare predictions from different machine learning models to see how they evaluate your heart disease risk.
                </Text>
            </motion.div>
            
            {error && (
                <Alert status="error" mb={4} className={styles.errorAlert}>
                    <AlertIcon />
                    <AlertTitle mr={2}>Error!</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {/* Model Performance Section */}
            {renderModelPerformance()}
            
            <Divider my={8} />
            
            {/* Prediction Comparison Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Heading size="md" mb={4}>Compare Model Predictions</Heading>
                <Text mb={4}>
                    Enter your health information to see how different models predict your heart disease risk.
                </Text>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <VStack spacing={4} align="flex-start">
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} width="100%">
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Age</FormLabel>
                                <Input 
                                    type="number" 
                                    name="age" 
                                    value={formData.age} 
                                    onChange={handleChange} 
                                    placeholder="Enter your age"
                                    className={styles.input}
                                />
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Sex</FormLabel>
                                <Select 
                                    name="sex" 
                                    value={formData.sex} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="1">Male</option>
                                    <option value="0">Female</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Chest Pain Type</FormLabel>
                                <Select 
                                    name="cp" 
                                    value={formData.cp} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="0">Typical Angina</option>
                                    <option value="1">Atypical Angina</option>
                                    <option value="2">Non-anginal Pain</option>
                                    <option value="3">Asymptomatic</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Resting Blood Pressure (mm Hg)</FormLabel>
                                <Input 
                                    type="number" 
                                    name="trestbps" 
                                    value={formData.trestbps} 
                                    onChange={handleChange} 
                                    placeholder="Enter resting blood pressure"
                                    className={styles.input}
                                />
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Serum Cholesterol (mg/dl)</FormLabel>
                                <Input 
                                    type="number" 
                                    name="chol" 
                                    value={formData.chol} 
                                    onChange={handleChange} 
                                    placeholder="Enter cholesterol level"
                                    className={styles.input}
                                />
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Fasting Blood Sugar {'>'} 120 mg/dl</FormLabel>
                                <Select 
                                    name="fbs" 
                                    value={formData.fbs} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Resting Electrocardiographic Results</FormLabel>
                                <Select 
                                    name="restecg" 
                                    value={formData.restecg} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="0">Normal</option>
                                    <option value="1">ST-T Wave Abnormality</option>
                                    <option value="2">Left Ventricular Hypertrophy</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Maximum Heart Rate Achieved</FormLabel>
                                <Input 
                                    type="number" 
                                    name="thalach" 
                                    value={formData.thalach} 
                                    onChange={handleChange} 
                                    placeholder="Enter maximum heart rate"
                                    className={styles.input}
                                />
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Exercise Induced Angina</FormLabel>
                                <Select 
                                    name="exang" 
                                    value={formData.exang} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>ST Depression Induced by Exercise</FormLabel>
                                <Input 
                                    type="number" 
                                    name="oldpeak" 
                                    value={formData.oldpeak} 
                                    onChange={handleChange} 
                                    placeholder="Enter ST depression value"
                                    step="0.1"
                                    className={styles.input}
                                />
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Slope of the Peak Exercise ST Segment</FormLabel>
                                <Select 
                                    name="slope" 
                                    value={formData.slope} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="0">Upsloping</option>
                                    <option value="1">Flat</option>
                                    <option value="2">Downsloping</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Number of Major Vessels Colored by Fluoroscopy</FormLabel>
                                <Select 
                                    name="ca" 
                                    value={formData.ca} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </Select>
                            </FormControl>
                            
                            <FormControl isRequired className={styles.formControl}>
                                <FormLabel>Thalassemia</FormLabel>
                                <Select 
                                    name="thal" 
                                    value={formData.thal} 
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="0">Normal</option>
                                    <option value="1">Fixed Defect</option>
                                    <option value="2">Reversible Defect</option>
                                    <option value="3">Unknown</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        
                        <Button 
                            type="submit" 
                            colorScheme="blue" 
                            width="full" 
                            isLoading={loading}
                            loadingText="Comparing Models..."
                            className={styles.submitButton}
                        >
                            Compare Models
                        </Button>
                    </VStack>
                </form>
            </motion.div>
            
            {loading && (
                <Box textAlign="center" mt={4} className={styles.loadingContainer}>
                    <Spinner size="xl" className={styles.spinner} />
                    <Text mt={2}>Comparing model predictions...</Text>
                </Box>
            )}
            
            {comparisonResult && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={styles.resultsContainer}
                >
                    <Box mt={6}>
                        <Heading size="md" mb={4}>Model Comparison Results</Heading>
                        
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            {/* Random Forest Model */}
                            <Box 
                                p={4} 
                                borderWidth="1px" 
                                borderRadius="md" 
                                bg={comparisonResult.random_forest.prediction === 1 ? "red.50" : "green.50"}
                                className={`${styles.modelResultCard} ${
                                    comparisonResult.random_forest.prediction === 1 ? styles.highRisk : styles.lowRisk
                                }`}
                            >
                                <Heading size="sm" mb={2}>Random Forest Model</Heading>
                                <Stat>
                                    <StatLabel>Prediction</StatLabel>
                                    <StatNumber>
                                        {comparisonResult.random_forest.prediction === 1 ? "High Risk" : "Low Risk"}
                                    </StatNumber>
                                    <StatHelpText>
                                        Probability: {(comparisonResult.random_forest.probability * 100).toFixed(2)}%
                                    </StatHelpText>
                                </Stat>
                                <Badge 
                                    colorScheme={comparisonResult.random_forest.prediction === 1 ? "red" : "green"} 
                                    mt={2}
                                    className={styles.resultBadge}
                                >
                                    {comparisonResult.random_forest.message}
                                </Badge>
                            </Box>
                            
                            {/* Neural Network Model */}
                            <Box 
                                p={4} 
                                borderWidth="1px" 
                                borderRadius="md" 
                                bg={comparisonResult.neural_network.prediction === 1 ? "red.50" : "green.50"}
                                className={`${styles.modelResultCard} ${
                                    comparisonResult.neural_network.prediction === 1 ? styles.highRisk : styles.lowRisk
                                }`}
                            >
                                <Heading size="sm" mb={2}>Neural Network Model</Heading>
                                <Stat>
                                    <StatLabel>Prediction</StatLabel>
                                    <StatNumber>
                                        {comparisonResult.neural_network.prediction === 1 ? "High Risk" : "Low Risk"}
                                    </StatNumber>
                                    <StatHelpText>
                                        Probability: {(comparisonResult.neural_network.probability * 100).toFixed(2)}%
                                    </StatHelpText>
                                </Stat>
                                <Badge 
                                    colorScheme={comparisonResult.neural_network.prediction === 1 ? "red" : "green"} 
                                    mt={2}
                                    className={styles.resultBadge}
                                >
                                    {comparisonResult.neural_network.message}
                                </Badge>
                            </Box>
                            
                            {/* Ensemble Model */}
                            <Box 
                                p={4} 
                                borderWidth="1px" 
                                borderRadius="md" 
                                bg={comparisonResult.ensemble.prediction === 1 ? "red.50" : "green.50"}
                                className={`${styles.modelResultCard} ${
                                    comparisonResult.ensemble.prediction === 1 ? styles.highRisk : styles.lowRisk
                                }`}
                            >
                                <Heading size="sm" mb={2}>Ensemble Model</Heading>
                                <Stat>
                                    <StatLabel>Prediction</StatLabel>
                                    <StatNumber>
                                        {comparisonResult.ensemble.prediction === 1 ? "High Risk" : "Low Risk"}
                                    </StatNumber>
                                    <StatHelpText>
                                        Probability: {(comparisonResult.ensemble.probability * 100).toFixed(2)}%
                                    </StatHelpText>
                                </Stat>
                                <Badge 
                                    colorScheme={comparisonResult.ensemble.prediction === 1 ? "red" : "green"} 
                                    mt={2}
                                    className={styles.resultBadge}
                                >
                                    {comparisonResult.ensemble.message}
                                </Badge>
                            </Box>
                        </SimpleGrid>
                        
                        <Box 
                            mt={4} 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="md" 
                            bg={comparisonResult.agreement ? "blue.50" : "yellow.50"}
                            className={`${styles.agreementBox} ${
                                comparisonResult.agreement ? styles.modelAgreement : styles.modelDisagreement
                            }`}
                        >
                            <Heading size="sm" mb={2}>Model Agreement</Heading>
                            <Text>
                                {comparisonResult.agreement 
                                    ? "The models agree on the prediction, which increases confidence in the result."
                                    : "The models disagree on the prediction. Consider consulting a healthcare professional for further evaluation."}
                            </Text>
                        </Box>
                    </Box>
                </motion.div>
            )}
        </Box>
    );
};

export default ModelComparison;
