import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/RiskSimulator.module.css';
import {
    Box, Heading, Text, Spinner, Alert, AlertIcon,
    Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark,
    Flex, Grid, GridItem, Badge, Stat, StatLabel, StatNumber, StatHelpText,
    Button, VStack, HStack, Tooltip, useToast
} from '@chakra-ui/react';
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const RiskSimulator = ({onPredictionUpdate}) => {
    const toast = useToast();

    // Initial values based on average/common values
    const initialValues = {
        age: 50,
        sex: 1, // 1 for male, 0 for female
        cp: 0, // chest pain type (0-3)
        trestbps: 120, // resting blood pressure
        chol: 200, // cholesterol
        fbs: 0, // fasting blood sugar > 120 mg/dl (1 = true; 0 = false)
        restecg: 0, // resting electrocardiographic results (0-2)
        thalach: 150, // maximum heart rate achieved
        exang: 0, // exercise induced angina (1 = yes; 0 = no)
        oldpeak: 0, // ST depression induced by exercise relative to rest
        slope: 1, // the slope of the peak exercise ST segment (0-2)
        ca: 0, // number of major vessels (0-3) colored by fluoroscopy
        thal: 2 // 0 = normal; 1 = fixed defect; 2 = reversible defect
    };

    // State for current values and prediction
    const [values, setValues] = useState(initialValues);
    const [baselinePrediction, setBaselinePrediction] = useState(null);
    const [currentPrediction, setCurrentPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [featureDescriptions, setFeatureDescriptions] = useState({});

    // Feature descriptions for tooltips
    useEffect(() => {
        setFeatureDescriptions({
            age: "Age in years",
            sex: "Gender (1 = male; 0 = female)",
            cp: "Chest pain type (0: typical angina, 1: atypical angina, 2: non-anginal pain, 3: asymptomatic)",
            trestbps: "Resting blood pressure in mm Hg",
            chol: "Serum cholesterol in mg/dl",
            fbs: "Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)",
            restecg: "Resting electrocardiographic results (0: normal, 1: ST-T wave abnormality, 2: left ventricular hypertrophy)",
            thalach: "Maximum heart rate achieved",
            exang: "Exercise induced angina (1 = yes; 0 = no)",
            oldpeak: "ST depression induced by exercise relative to rest",
            slope: "Slope of the peak exercise ST segment (0: upsloping, 1: flat, 2: downsloping)",
            ca: "Number of major vessels (0-3) colored by fluoroscopy",
            thal: "Thalassemia (0: normal, 1: fixed defect, 2: reversible defect)"
        });
    }, []);

    // Get initial prediction on component mount
    useEffect(() => {
        getPrediction(values, true);
    }, []);

    // Function to get prediction from API
    const getPrediction = async (data, isBaseline = false) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', data);

            if (isBaseline) {
                setBaselinePrediction(response.data);
            }

            setCurrentPrediction(response.data);
            if (onPredictionUpdate) {
                onPredictionUpdate({
                  ...response.data,
                  input_data: data
                });
              }
            setLoading(false);
        } catch (err) {
            console.error('Error getting prediction:', err);
            setError('Failed to get prediction. Please try again.');
            setLoading(false);

            toast({
                title: 'Error',
                description: 'Failed to get prediction from the server.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Handle slider change
    const handleSliderChange = (name, value) => {
        const newValues = { ...values, [name]: value };
        setValues(newValues);

        // Debounce the API call to avoid too many requests
        if (window.predictionTimeout) {
            clearTimeout(window.predictionTimeout);
        }

        window.predictionTimeout = setTimeout(() => {
            getPrediction(newValues);
        }, 500);
    };

    // Reset to baseline values
    const handleReset = () => {
        setValues(initialValues);
        getPrediction(initialValues);

        toast({
            title: 'Reset Complete',
            description: 'All values have been reset to baseline.',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };

    // Calculate risk change percentage
    const calculateRiskChange = () => {
        if (!baselinePrediction || !currentPrediction) return 0;

        const baselineRisk = baselinePrediction.probability * 100;
        const currentRisk = currentPrediction.probability * 100;

        return currentRisk - baselineRisk;
    };

    // Get color based on risk level
    const getRiskColor = (risk) => {
        if (risk < 20) return "green.500";
        if (risk < 40) return "yellow.500";
        if (risk < 60) return "orange.500";
        return "red.500";
    };

    // Get color for risk change
    const getRiskChangeColor = (change) => {
        if (change < -5) return "green.500";
        if (change < 0) return "green.400";
        if (change === 0) return "gray.500";
        if (change < 5) return "orange.400";
        return "red.500";
    };

    // Render risk prediction stats
    const renderRiskStats = () => {
        if (!currentPrediction) return null;

        const riskPercentage = currentPrediction.probability * 100;
        const riskChange = calculateRiskChange();
        const riskColor = getRiskColor(riskPercentage);
        const changeColor = getRiskChangeColor(riskChange);

        return (
            <Box
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                shadow="md"
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={styles.riskStatsContainer}
            >
                <Heading size="md" mb={4}>Heart Disease Risk Assessment</Heading>

                <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" mb={6}>
                    <Stat textAlign="center" mb={{ base: 4, md: 0 }}>
                        <StatLabel fontSize="lg">Current Risk</StatLabel>
                        <StatNumber fontSize="4xl" color={riskColor} className={`${styles.riskValue} ${
                            riskPercentage < 20 ? styles.riskLow : 
                            riskPercentage < 40 ? styles.riskModerate : 
                            styles.riskHigh
                        }`}>
                            {riskPercentage.toFixed(1)}%
                        </StatNumber>
                        <StatHelpText>
                            {riskPercentage < 20 ? "Low Risk" :
                                riskPercentage < 40 ? "Moderate Risk" :
                                    riskPercentage < 60 ? "High Risk" : "Very High Risk"}
                        </StatHelpText>
                    </Stat>

                    <Stat textAlign="center">
                        <StatLabel fontSize="lg">Change from Baseline</StatLabel>
                        <StatNumber fontSize="3xl" color={changeColor} className={`${styles.changeValue} ${
                            riskChange < 0 ? styles.improved : 
                            riskChange > 0 ? styles.worsened : 
                            styles.noChange
                        }`}>
                            {riskChange > 0 ? "+" : ""}{riskChange.toFixed(1)}%
                        </StatNumber>
                        <StatHelpText>
                            {riskChange < 0 ? "Improved" : riskChange > 0 ? "Worsened" : "No Change"}
                        </StatHelpText>
                    </Stat>
                </Flex>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                    This assessment is based on the current values you've set. Adjust the sliders to see how changes in different factors affect your risk.
                </Text>
            </Box>
        );
    };

    // Render a slider for a numeric feature
    const renderSlider = (name, min, max, step, isInteger = true) => {
        const value = values[name];
        const description = featureDescriptions[name] || "";

        return (
            <Box mb={6} className={styles.sliderContainer}>
                <Flex justify="space-between" align="center" mb={2} className={styles.sliderLabel}>
                    <Tooltip label={description} placement="top">
                        <HStack spacing={1}>
                            <Text fontWeight="medium">{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
                            <InfoIcon boxSize={3} color="gray.500" />
                        </HStack>
                    </Tooltip>
                    <Badge colorScheme="blue" fontSize="md" className={styles.sliderValue}>
                        {isInteger ? value : value.toFixed(1)}
                    </Badge>
                </Flex>

                <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(val) => handleSliderChange(name, val)}
                    colorScheme="blue"
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                </Slider>

                <Flex justify="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.500">{min}</Text>
                    <Text fontSize="xs" color="gray.500">{max}</Text>
                </Flex>
            </Box>
        );
    };

    // Render a slider for a categorical feature
    const renderCategoricalSlider = (name, options) => {
        const value = values[name];
        const description = featureDescriptions[name] || "";
        const max = options.length - 1;

        return (
            <Box mb={6} className={styles.sliderContainer}>
                <Flex justify="space-between" align="center" mb={2} className={styles.sliderLabel}>
                    <Tooltip label={description} placement="top">
                        <HStack spacing={1}>
                            <Text fontWeight="medium">{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
                            <InfoIcon boxSize={3} color="gray.500" />
                        </HStack>
                    </Tooltip>
                    <Badge colorScheme="purple" fontSize="md" className={styles.sliderValue}>
                        {options[value]}
                    </Badge>
                </Flex>

                <Slider
                    min={0}
                    max={max}
                    step={1}
                    value={value}
                    onChange={(val) => handleSliderChange(name, val)}
                    colorScheme="purple"
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />

                    {options.map((option, index) => (
                        <SliderMark
                            key={index}
                            value={index}
                            fontSize="xs"
                            mt={2}
                            ml={-2}
                            width="12"
                            textAlign="center"
                        >
                            {index}
                        </SliderMark>
                    ))}
                </Slider>
            </Box>
        );
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.50" className={styles.simulatorContainer}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Heading mb={2} size="lg" className={styles.heading}>Risk Simulator</Heading>
                <Text mb={6}>
                    Adjust the sliders below to see how changes in different health factors affect your heart disease risk prediction.
                </Text>
            </motion.div>

            {error && (
                <Alert status="error" mb={6}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" my={10} className={styles.loadingContainer}>
                    <Spinner size="xl" className={styles.spinner} />
                    <Text mt={4}>Calculating risk prediction...</Text>
                </Box>
            ) : (
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                    <GridItem>
                        <Box bg="white" p={6} borderRadius="md" shadow="sm">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md">Modifiable Factors</Heading>
                                <Button
                                    leftIcon={<RepeatIcon />}
                                    colorScheme="blue"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className={styles.resetButton}
                                >
                                    Reset All
                                </Button>
                            </Flex>

                            {/* Modifiable risk factors */}
                            {renderSlider("chol", 100, 500, 1)}
                            {renderSlider("trestbps", 90, 200, 1)}
                            {renderSlider("thalach", 70, 220, 1)}
                            {renderCategoricalSlider("fbs", ["No", "Yes"])}
                            {renderCategoricalSlider("exang", ["No", "Yes"])}
                        </Box>
                    </GridItem>

                    <GridItem>
                        <VStack spacing={8}>
                            {/* Risk prediction display */}
                            {renderRiskStats()}

                            <Box bg="white" p={6} borderRadius="md" shadow="sm" width="100%">
                                <Heading size="md" mb={6}>Other Factors</Heading>

                                {/* Non-modifiable or less commonly modified factors */}
                                {renderSlider("age", 20, 80, 1)}
                                {renderCategoricalSlider("sex", ["Female", "Male"])}
                                {renderCategoricalSlider("cp", ["Typical Angina", "Atypical Angina", "Non-anginal Pain", "Asymptomatic"])}
                                {renderSlider("oldpeak", 0, 6, 0.1, false)}
                                {renderCategoricalSlider("slope", ["Upsloping", "Flat", "Downsloping"])}
                                {renderCategoricalSlider("ca", ["0", "1", "2", "3"])}
                                {renderCategoricalSlider("thal", ["Normal", "Fixed Defect", "Reversible Defect"])}
                                {renderCategoricalSlider("restecg", ["Normal", "ST-T Wave Abnormality", "Left Ventricular Hypertrophy"])}
                            </Box>
                        </VStack>
                    </GridItem>
                </Grid>
            )}

            <Box mt={8} p={4} bg="blue.50" borderRadius="md" className={styles.infoBox}>
                <Heading size="sm" mb={2}>How to use this simulator</Heading>
                <Text fontSize="sm">
                    This simulator shows how changes in various health metrics might affect your heart disease risk.
                    The modifiable factors are those you can typically change through lifestyle modifications or medical interventions.
                    Adjust the sliders to see how improving specific factors could potentially reduce your risk.
                </Text>
                <Text fontSize="sm" mt={2} fontStyle="italic">
                    Note: This is a simulation based on a machine learning model and should not replace professional medical advice.
                </Text>
            </Box>
        </Box>
    );
};

export default RiskSimulator;
