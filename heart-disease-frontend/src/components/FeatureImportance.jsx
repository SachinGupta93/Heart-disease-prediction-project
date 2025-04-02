import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/FeatureImportance.module.css';
import { 
    Box, Heading, Text, Spinner, Alert, AlertIcon, 
    AlertTitle, AlertDescription, VStack, Flex
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const FeatureImportance = () => {
    const [featureImportance, setFeatureImportance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const chartContainerRef = useRef(null);

    useEffect(() => {
        const fetchFeatureImportance = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/models/feature-importance');
                // Sort features by importance (descending)
                const sortedFeatures = response.data.sort((a, b) => b.importance - a.importance);
                setFeatureImportance(sortedFeatures);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feature importance:', error);
                setError('Failed to load feature importance data. Please try again later.');
                setLoading(false);
            }
        };

        fetchFeatureImportance();
    }, []);

    // Function to get color based on importance value
    const getImportanceColor = (importance) => {
        if (importance > 0.15) return "#E53E3E"; // red.500
        if (importance > 0.1) return "#DD6B20"; // orange.500
        if (importance > 0.05) return "#D69E2E"; // yellow.500
        return "#38A169"; // green.500
    };

    // Handle mouse enter for bar hover effect
    const handleMouseEnter = (index) => {
        setActiveIndex(index);
    };

    // Handle mouse leave for bar hover effect
    const handleMouseLeave = () => {
        setActiveIndex(null);
    };

    // Simple bar chart display
    const renderBarChart = () => {
        if (!featureImportance.length) return null;
        
        return (
            <Box mt={6} mb={8} overflowX="auto" className={styles.chartContainer}>
                <VStack spacing={4} align="stretch">
                    {featureImportance.map((item, index) => (
                        <Box 
                            key={index} 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="md" 
                            bg="gray.50"
                            className={`${styles.featureBar} ${activeIndex === index ? styles.featureBarActive : ''}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text fontWeight="bold" className={styles.featureName}>{item.feature}</Text>
                                <Text fontWeight="semibold" className={styles.featureValue}>
                                    {(item.importance * 100).toFixed(1)}%
                                </Text>
                            </Flex>
                            <Box 
                                h="24px" 
                                bg="gray.200" 
                                borderRadius="md" 
                                overflow="hidden"
                                position="relative"
                                className={styles.barContainer}
                            >
                                <Box 
                                    h="100%" 
                                    w={`${Math.min(item.importance * 100 * 1.5, 100)}%`} 
                                    bg={getImportanceColor(item.importance)} 
                                    transition="width 0.5s ease-in-out"
                                    className={styles.barFill}
                                />
                            </Box>
                            <Text fontSize="sm" mt={2} color="gray.600" className={styles.featureDescription}>
                                {item.description}
                            </Text>
                        </Box>
                    ))}
                </VStack>
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
                <Heading mb={4} size="lg" className={styles.heading}>Feature Importance</Heading>
                <Text mb={4} className={styles.description}>
                    This visualization shows which health factors have the most significant impact on heart disease prediction according to our machine learning model.
                </Text>
            </motion.div>
            
            {error && (
                <Alert status="error" mb={4} className={styles.errorAlert}>
                    <AlertIcon />
                    <AlertTitle mr={2}>Error!</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {loading ? (
                <Box textAlign="center" my={8} className={styles.loadingContainer}>
                    <Spinner size="xl" className={styles.spinner} />
                    <Text mt={4}>Loading feature importance data...</Text>
                </Box>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    {/* Feature Importance Chart */}
                    <Box ref={chartContainerRef}>
                        <Heading size="md" mb={4}>Feature Importance Chart</Heading>
                        {renderBarChart()}
                    </Box>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <Box mt={6} p={4} borderWidth="1px" borderRadius="md" bg="blue.50" className={styles.infoBox}>
                            <Heading size="sm" mb={2}>What does this mean?</Heading>
                            <Text>
                                Features with higher importance have a stronger influence on the model's predictions. 
                                If you have risk factors in the high-importance categories, it's especially important 
                                to discuss them with your healthcare provider.
                            </Text>
                        </Box>
                    </motion.div>
                </motion.div>
            )}
        </Box>
    );
};

export default FeatureImportance;
