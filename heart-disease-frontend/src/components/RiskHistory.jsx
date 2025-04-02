import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/RiskHistory.module.css';
import {
    Box, Heading, Text, Spinner, Alert, AlertIcon,
    Button, VStack, HStack, Flex, Badge, Divider,
    Table, Thead, Tbody, Tr, Th, Td,
    useToast, useColorModeValue
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RiskHistory = ({ currentPrediction }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        fetchRiskHistory();
    }, []);

    const fetchRiskHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:5000/history');

            // Sort by date (newest first)
            const sortedHistory = response.data.sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

            setHistory(sortedHistory);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching risk history:', err);
            setError('Failed to load risk history. Please try again.');
            setLoading(false);
        }
    };

    const saveCurrentPrediction = async () => {
        if (!currentPrediction) {
            toast({
                title: 'No prediction to save',
                description: 'Please make a prediction first.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await axios.post('http://127.0.0.1:5000/history', {
                ...currentPrediction,
                date: new Date().toISOString()
            });

            toast({
                title: 'Prediction saved',
                description: 'Your prediction has been saved to history.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Refresh history
            fetchRiskHistory();
        } catch (err) {
            console.error('Error saving prediction:', err);
            toast({
                title: 'Error',
                description: 'Failed to save prediction. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const deleteHistoryItem = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/history/${id}`);

            toast({
                title: 'Entry deleted',
                description: 'The history entry has been deleted.',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });

            // Refresh history
            fetchRiskHistory();
        } catch (err) {
            console.error('Error deleting history item:', err);
            toast({
                title: 'Error',
                description: 'Failed to delete entry. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get color based on risk level
    const getRiskColor = (probability) => {
        if (probability < 0.2) return "green.500";
        if (probability < 0.4) return "yellow.500";
        if (probability < 0.6) return "orange.500";
        return "red.500";
    };

    // Prepare data for the line chart
    const prepareChartData = () => {
        // Sort by date (oldest first for the chart)
        const sortedData = [...history].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        return sortedData.map(item => ({
            date: formatDate(item.date),
            risk: (item.probability * 100).toFixed(1),
            riskLevel: item.risk_level
        }));
    };

    // Calculate risk trend
    const calculateRiskTrend = () => {
        if (history.length < 2) return null;

        // Sort by date (oldest first)
        const sortedData = [...history].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        const firstRisk = sortedData[0].probability;
        const lastRisk = sortedData[sortedData.length - 1].probability;
        const difference = lastRisk - firstRisk;

        return {
            direction: difference > 0 ? 'increased' : difference < 0 ? 'decreased' : 'unchanged',
            percentage: Math.abs(difference * 100).toFixed(1)
        };
    };

    // Predict future risk based on current trend
    const predictFutureRisk = () => {
        if (history.length < 3) return null;

        // Sort by date (oldest first)
        const sortedData = [...history].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        // Simple linear regression to predict trend
        const xValues = sortedData.map((_, index) => index);
        const yValues = sortedData.map(item => item.probability);

        // Calculate slope and intercept
        const n = xValues.length;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict risk in 30 days (assuming one data point per day)
        const futureX = n + 30;
        const predictedRisk = intercept + slope * futureX;

        // Clamp between 0 and 1
        const clampedRisk = Math.max(0, Math.min(1, predictedRisk));

        return {
            risk: (clampedRisk * 100).toFixed(1),
            trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
        };
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg={bgColor} className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Flex justify="space-between" align="center" mb={4} className={styles.header}>
                    <Heading size="lg" className={styles.heading}>Risk History</Heading>
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        onClick={saveCurrentPrediction}
                        isDisabled={!currentPrediction}
                        className={styles.saveButton}
                    >
                        Save Current Prediction
                    </Button>
                </Flex>
                <Text mb={6}>
                    Track how your heart disease risk changes over time. Save your current prediction to build your history.
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
                    <Text mt={4}>Loading your risk history...</Text>
                </Box>
            ) : (
                <VStack spacing={8} align="stretch">
                    {history.length === 0 ? (
                        <Box p={6} textAlign="center" borderWidth="1px" borderRadius="lg" borderStyle="dashed" className={styles.emptyState}>
                            <Text fontSize="lg" mb={4}>No history data yet</Text>
                            <Text color="gray.600">
                                Save your current prediction to start tracking your risk over time.
                            </Text>
                        </Box>
                    ) : (
                        <>
                            {/* Risk trend visualization */}
                            <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" className={styles.chartContainer}>
                                <Heading size="md" mb={4}>Risk Trend Over Time</Heading>
                                <Box h="300px" w="100%" position="relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={prepareChartData()}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis
                                                label={{ value: 'Risk (%)', angle: -90, position: 'insideLeft' }}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                formatter={(value) => [`${value}%`, 'Risk']}
                                                labelFormatter={(label) => `Date: ${label}`}
                                                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="risk"
                                                stroke="#3182CE"
                                                activeDot={{ r: 8 }}
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>

                            {/* Risk trend analysis */}
                            <Flex direction={{ base: "column", md: "row" }} gap={4}>
                                {/* Overall trend */}
                                <Box flex="1" p={4} borderWidth="1px" borderRadius="lg" bg="white" className={styles.trendBox}>
                                    <Heading size="sm" mb={3}>Overall Trend</Heading>
                                    {calculateRiskTrend() ? (
                                        <Text fontSize="lg">
                                            Your risk has <Badge colorScheme={calculateRiskTrend().direction === 'decreased' ? 'green' : calculateRiskTrend().direction === 'increased' ? 'red' : 'gray'} className={styles.trendBadge}>
                                                {calculateRiskTrend().direction}
                                            </Badge> by <strong>{calculateRiskTrend().percentage}%</strong> since your first assessment.
                                        </Text>
                                    ) : (
                                        <Text>Not enough data to calculate trend.</Text>
                                    )}
                                </Box>

                                {/* Future projection */}
                                <Box flex="1" p={4} borderWidth="1px" borderRadius="lg" bg="white" className={styles.projectionBox}>
                                    <Heading size="sm" mb={3}>30-Day Projection</Heading>
                                    {predictFutureRisk() ? (
                                        <Text fontSize="lg">
                                            Based on your current trend, your risk is projected to be <Badge colorScheme={predictFutureRisk().risk < 20 ? 'green' : predictFutureRisk().risk < 40 ? 'yellow' : predictFutureRisk().risk < 60 ? 'orange' : 'red'} className={styles.projectionBadge}>
                                                {predictFutureRisk().risk}%
                                            </Badge> in 30 days.
                                        </Text>
                                    ) : (
                                        <Text>Not enough data for projection. Save at least 3 predictions.</Text>
                                    )}
                                </Box>
                            </Flex>

                            {/* History table */}
                            <Box className={styles.tableContainer}>
                                <Heading size="md" mb={4}>History Entries</Heading>
                                <Table variant="simple" className={styles.historyTable}>
                                    <Thead>
                                        <Tr>
                                            <Th>Date</Th>
                                            <Th>Risk Level</Th>
                                            <Th>Risk Percentage</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {history.map((item) => (
                                            <Tr key={item.id} className={styles.tableRow}>
                                                <Td>{formatDate(item.date)}</Td>
                                                <Td>
                                                    <Badge colorScheme={
                                                        item.risk_level === "Low Risk" ? "green" :
                                                            item.risk_level === "Moderate Risk" ? "yellow" :
                                                                item.risk_level === "High Risk" ? "orange" : "red"
                                                    } className={styles.riskBadge}>
                                                        {item.risk_level}
                                                    </Badge>
                                                </Td>
                                                <Td color={getRiskColor(item.probability)} className={styles.riskPercentage}>
                                                    {(item.probability * 100).toFixed(1)}%
                                                </Td>
                                                <Td>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        leftIcon={<DeleteIcon />}
                                                        onClick={() => deleteHistoryItem(item.id)}
                                                        className={styles.deleteButton}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </>
                    )}

                    <Box p={4} bg="gray.50" borderRadius="md" className={styles.infoBox}>
                        <Heading size="sm" mb={2}>Why track your risk over time?</Heading>
                        <Text fontSize="sm">
                            Monitoring your heart disease risk over time helps you see the impact of lifestyle changes and medical interventions.
                            Regular tracking can provide motivation as you see improvements and help identify when additional attention may be needed.
                        </Text>
                    </Box>
                </VStack>
            )}
        </Box>
    );
};

export default RiskHistory;


