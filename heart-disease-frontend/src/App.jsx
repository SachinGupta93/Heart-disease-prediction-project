import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Grid,
  VStack,
  Heading,
  Text,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import theme from './theme';

// Import all available components from the codebase
import PredictionForm from './components/PredictionForm';
import FeatureImportance from './components/FeatureImportance';
import ModelComparison from './components/ModelComparison';
import HealthInformation from './components/HealthInformation';
import RiskSimulator from './components/RiskSimulator';
import ExplainableAi from './components/ExplainableAi';
import RiskHistory from './components/RiskHistory';

function App() {
  const [currentPrediction, setCurrentPrediction] = useState(null);
  
  // Handler to receive prediction data from PredictionForm or RiskSimulator
  const handlePredictionUpdate = (predictionData) => {
    setCurrentPrediction(predictionData);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <Heading as="h1" size="2xl">Heart Disease Risk Predictor</Heading>
            <Text>
              Assess your risk of heart disease and understand the factors that contribute to it.
            </Text>
            
            <Container maxW="container.xl" p={0}>
              <Tabs variant="enclosed" colorScheme="blue" size="lg" isFitted>
                <TabList mb="1em">
                  <Tab>Prediction</Tab>
                  <Tab>Risk Simulator</Tab>
                  <Tab>Explanation</Tab>
                  <Tab>Feature Importance</Tab>
                  <Tab>Risk History</Tab>
                  <Tab>Model Comparison</Tab>
                  <Tab>Health Info</Tab>
                </TabList>
                <TabPanels>
                  {/* Prediction Form Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      Enter your health information to get a personalized heart disease risk assessment.
                    </Text>
                    <Text mb={4}>
                      This tool uses machine learning to estimate your risk based on clinical factors.
                    </Text>
                    <PredictionForm onPredictionUpdate={handlePredictionUpdate} />
                  </TabPanel>
                  
                  {/* Risk Simulator Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      Simulate how changes to your health metrics could affect your heart disease risk.
                    </Text>
                    <Text mb={4}>
                      Adjust the sliders to see how lifestyle modifications might impact your risk level.
                    </Text>
                    <RiskSimulator onPredictionUpdate={handlePredictionUpdate} />
                  </TabPanel>
                  
                  {/* Explainable AI Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      This section explains the model's predictions and the factors that influence them.
                    </Text>
                    <Text mb={4}>
                      Understand how your health data is interpreted by the model.
                    </Text>
                    <ExplainableAi predictionData={currentPrediction} />
                  </TabPanel>
                  
                  {/* Feature Importance Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      Discover which health factors have the greatest impact on heart disease risk.
                    </Text>
                    <Text mb={4}>
                      The chart below shows the relative importance of each factor in the prediction model.
                    </Text>
                    <FeatureImportance />
                  </TabPanel>
                  
                  {/* Risk History Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      Track how your heart disease risk changes over time.
                    </Text>
                    <Text mb={4}>
                      Save your assessments to monitor your progress and see the impact of lifestyle changes.
                    </Text>
                    <RiskHistory currentPrediction={currentPrediction} />
                  </TabPanel>
                  
                  {/* Model Comparison Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      Compare the performance of different machine learning models for heart disease prediction.
                    </Text>
                    <Text mb={4}>
                      See how various algorithms perform in terms of accuracy, precision, and recall.
                    </Text>
                    <ModelComparison />
                  </TabPanel>
                  
                  {/* Health Information Tab */}
                  <TabPanel>
                    <Text mb={4}>
                      Learn about heart disease risk factors, prevention strategies, and treatment options.
                    </Text>
                    <Text mb={4}>
                      Educational resources to help you understand and manage your cardiovascular health.
                    </Text>
                    <HealthInformation />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Container>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
