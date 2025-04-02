import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.100" py={4}>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        maxWidth="1200px" 
        mx="auto" 
        px={4} 
        justify="space-between" 
        align="center"
      >
        <Text fontSize="sm">
          © {new Date().getFullYear()} Heart Disease Prediction App
        </Text>
        <Text fontSize="sm" mt={{ base: 2, md: 0 }}>
          This application is for educational purposes only. Not for medical diagnosis.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
