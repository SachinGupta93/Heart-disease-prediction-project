import React, { useState, useEffect } from 'react';

import styles from '../styles/ExplainableAi.module.css';
import {
    Box, Heading, Text, Spinner, Alert, AlertIcon,
    VStack, HStack, Flex, Badge, Divider,
    SimpleGrid, Progress, Stat, StatLabel, StatNumber, StatHelpText,
    Button, useToast
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { getPredictionExplanation } from '../services/api';

const ExplainableAi = ({ predictionData }) => {
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        if (predictionData) {
            fetchExplanation(predictionData);
        }
    }, [predictionData]);

    const fetchExplanation = async (data) => {
        setLoading(true);
        setError(null);

        try {
            // Use the imported function from api.js
            const response = await getPredictionExplanation(data.input_data || data);
            setExplanation(response);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching explanation:', err);
            setError('Failed to get explanation for this prediction. Please try again.');
            setLoading(false);

            toast({
                title: 'Error',
                description: 'Could not retrieve explanation for this prediction.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Get color based on contribution value
    const getContributionColor = (contribution) => {
        if (contribution > 0.5) return "red.500";
        if (contribution > 0.2) return "orange.500";
        if (contribution > 0.1) return "yellow.500";
        return "green.500";
    };

    // Get progress bar color based on importance
    const getImportanceColor = (importance) => {
        if (importance > 0.15) return "red";
        if (importance > 0.1) return "orange";
        if (importance > 0.05) return "yellow";
        return "green";
    };

    // Render feature contributions
    const renderFeatureContributions = () => {
        if (!explanation || !explanation.feature_contributions) return null;

        return (
            <Box className={styles.contributionsContainer}>
                <Heading size="md" mb={4}>Feature Contributions</Heading>
                <Text mb={4}>
                    The chart below shows how each feature contributed to your prediction.
                    Larger values indicate a stronger influence on the prediction result.
                </Text>

                <VStack spacing={4} align="stretch" mt={6}>
                    {explanation.feature_contributions.map((feature, index) => (
                        <Box key={index} p={4} borderWidth="1px" borderRadius="md" className={styles.featureCard}>
                            <Flex justify="space-between" align="center" mb={2}>
                                <HStack>
                                    <Text fontWeight="bold">{feature.feature}</Text>
                                    <Badge colorScheme="blue">{feature.value}</Badge>
                                </HStack>
                                <Badge 
                                    colorScheme={getImportanceColor(feature.importance) === "red" ? "red" : 
                                                getImportanceColor(feature.importance) === "orange" ? "orange" : 
                                                getImportanceColor(feature.importance) === "yellow" ? "yellow" : "green"}
                                >
                                    {(feature.importance * 100).toFixed(1)}% importance
                                </Badge>
                            </Flex>
                            
                            <Text fontSize="sm" mb={3} color="gray.600">
                                {feature.description}
                            </Text>
                            
                            <Text fontSize="sm" mb={2}>Contribution to prediction:</Text>
                            <Progress 
                                value={Math.abs(feature.contribution) * 100} 
                                colorScheme={getImportanceColor(feature.importance)}
                                size="sm"
                                borderRadius="full"
                                className={styles.progressBar}
                            />
                        </Box>
                    ))}
                </VStack>
            </Box>
        );
    };

    // Render prediction explanation
    const renderPredictionExplanation = () => {
        if (!explanation) return null;

        return (
            <Box className={styles.explanationContainer}>
                <Heading size="md" mb={4}>Prediction Explanation</Heading>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg={explanation.prediction === 1 ? "red.50" : "green.50"} className={styles.predictionBox}>
                    <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
                        <VStack align="flex-start" spacing={1}>
                            <Badge 
                                colorScheme={explanation.prediction === 1 ? "red" : "green"} 
                                fontSize="md"
                                p={2}
                                borderRadius="md"
                            >
                                {explanation.prediction === 1 ? "High Risk" : "Low Risk"}
                            </Badge>
                            <Text fontSize="lg" fontWeight="medium">
                                {explanation.risk_level} Risk Level
                            </Text>
                        </VStack>
                        
                        <Stat textAlign={{ base: "left", md: "right" }} mt={{ base: 4, md: 0 }}>
                            <StatLabel>Probability</StatLabel>
                            <StatNumber color={explanation.prediction === 1 ? "red.500" : "green.500"}>
                                {(explanation.probability * 100).toFixed(1)}%
                            </StatNumber>
                            <StatHelpText>
                                Confidence in prediction
                            </StatHelpText>
                        </Stat>
                    </Flex>
                    
                    <Divider my={4} />
                    
                    <Text fontSize="md" fontWeight="medium">
                        {explanation.explanation}
                    </Text>
                </Box>
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
                <Heading mb={4} size="lg" className={styles.heading}>Explainable AI</Heading>
                <Text mb={6}>
                    This section helps you understand how the AI model arrived at its prediction and which factors were most influential.
                </Text>
            </motion.div>

            {!predictionData && !explanation && !loading && (
                <Alert status="info" mb={6} className={styles.infoAlert}>
                    <AlertIcon />
                    <Text>
                        No prediction data available. Please make a prediction first using the Prediction Form or Risk Simulator.
                    </Text>
                </Alert>
            )}

            {error && (
                <Alert status="error" mb={6} className={styles.errorAlert}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" my={10} className={styles.loadingContainer}>
                    <Spinner size="xl" className={styles.spinner} />
                    <Text mt={4}>Analyzing your prediction...</Text>
                </Box>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    {explanation && (
                        <VStack spacing={8} align="stretch">
                            {renderPredictionExplanation()}
                            
                            <Divider />
                            
                            {renderFeatureContributions()}
                            
                            <Box p={4} bg="blue.50" borderRadius="md" className={styles.infoBox}>
                                <Heading size="sm" mb={2}>How to interpret this explanation</Heading>
                                <Text fontSize="sm">
                                    The model analyzes your health data and identifies patterns associated with heart disease risk.
                                    Features with higher importance have a stronger influence on the prediction.
                                    This explanation helps you understand which factors are contributing most to your risk assessment.
                                </Text>
                            </Box>
                        </VStack>
                    )}
                </motion.div>
            )}
        </Box>
    );
};

export default ExplainableAi;
