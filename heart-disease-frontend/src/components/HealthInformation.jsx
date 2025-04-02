import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/HealthInformation.module.css';
import {
    Box, Heading, Text, Spinner, Alert, AlertIcon,
    VStack, HStack, Flex, Badge, Divider, Link,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    List, ListItem, ListIcon, SimpleGrid, Icon, Button
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon, ExternalLinkIcon, WarningIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const HealthInformation = () => {
    const [healthInfo, setHealthInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHealthInfo = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/health-info');
                setHealthInfo(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching health information:', error);
                setError('Failed to load health information. Please try again later.');
                setLoading(false);
            }
        };

        fetchHealthInfo();
    }, []);

    // Render risk factors section
    const renderRiskFactors = () => {
        if (!healthInfo || !healthInfo.risk_factors) return null;

        return (
            <Box className={styles.section}>
                <Heading size="md" mb={4} className={styles.sectionHeading}>Heart Disease Risk Factors</Heading>
                <Text mb={4}>
                    Understanding your risk factors is the first step in preventing heart disease. 
                    Some risk factors can be modified, while others cannot.
                </Text>

                <Accordion allowMultiple className={styles.accordion}>
                    {healthInfo.risk_factors.map((factor, index) => (
                        <AccordionItem key={index} className={styles.accordionItem}>
                            <h2>
                                <AccordionButton className={styles.accordionButton}>
                                    <Box flex="1" textAlign="left" fontWeight="600">
                                        <HStack>
                                            <Icon as={WarningIcon} color="red.500" />
                                            <Text>{factor.name}</Text>
                                        </HStack>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4} className={styles.accordionPanel}>
                                <Text mb={3}>{factor.description}</Text>
                                <Heading size="xs" mb={2}>Recommendations:</Heading>
                                <List spacing={2}>
                                    {factor.recommendations.map((rec, idx) => (
                                        <ListItem key={idx} className={styles.listItem}>
                                            <ListIcon as={CheckCircleIcon} color="green.500" />
                                            {rec}
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Box>
        );
    };

    // Render prevention tips section
    const renderPreventionTips = () => {
        if (!healthInfo || !healthInfo.prevention_tips) return null;

        return (
            <Box className={styles.section}>
                <Heading size="md" mb={4} className={styles.sectionHeading}>Prevention Strategies</Heading>
                <Text mb={4}>
                    Many heart diseases can be prevented by making healthy lifestyle choices and managing health conditions.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {healthInfo.prevention_tips.map((tip, index) => (
                        <Box key={index} p={4} borderWidth="1px" borderRadius="lg" className={styles.tipCard}>
                            <HStack spacing={3} align="flex-start">
                                <Box className={styles.tipIconContainer}>
                                    <Icon as={CheckCircleIcon} color="green.500" boxSize={6} />
                                </Box>
                                <Text>{tip}</Text>
                            </HStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
        );
    };

    // Render resources section
    const renderResources = () => {
        if (!healthInfo || !healthInfo.resources) return null;

        return (
            <Box className={styles.section}>
                <Heading size="md" mb={4} className={styles.sectionHeading}>Additional Resources</Heading>
                <Text mb={4}>
                    Learn more about heart disease from these trusted sources.
                </Text>

                <VStack spacing={4} align="stretch">
                    {healthInfo.resources.map((resource, index) => (
                        <Link 
                            key={index} 
                            href={resource.url} 
                            isExternal 
                            className={styles.resourceLink}
                        >
                            <Flex 
                                p={4} 
                                borderWidth="1px" 
                                borderRadius="lg" 
                                justify="space-between" 
                                align="center"
                                className={styles.resourceCard}
                            >
                                <HStack>
                                    <InfoIcon color="blue.500" />
                                    <Text fontWeight="medium">{resource.name}</Text>
                                </HStack>
                                <ExternalLinkIcon />
                            </Flex>
                        </Link>
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
                <Heading mb={4} size="lg" className={styles.heading}>Heart Health Information</Heading>
                <Text mb={6}>
                    Learn about heart disease risk factors, prevention strategies, and find resources to help you maintain a healthy heart.
                </Text>
            </motion.div>

            {error && (
                <Alert status="error" mb={6} className={styles.errorAlert}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" my={10} className={styles.loadingContainer}>
                    <Spinner size="xl" className={styles.spinner} />
                    <Text mt={4}>Loading health information...</Text>
                </Box>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <VStack spacing={8} align="stretch">
                        {renderRiskFactors()}
                        
                        <Divider />
                        
                        {renderPreventionTips()}
                        
                        <Divider />
                        
                        {renderResources()}
                        
                        <Box p={4} bg="blue.50" borderRadius="md" className={styles.disclaimerBox}>
                            <Heading size="sm" mb={2}>Medical Disclaimer</Heading>
                            <Text fontSize="sm">
                                The information provided on this page is for educational purposes only and is not intended as medical advice.
                                Always consult with a qualified healthcare provider regarding any medical conditions or health concerns.
                            </Text>
                        </Box>
                    </VStack>
                </motion.div>
            )}
        </Box>
    );
};

export default HealthInformation;
