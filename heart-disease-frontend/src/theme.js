import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#bae3ff',
      200: '#7cc4fa',
      300: '#47a3f3',
      400: '#2186eb',
      500: '#0967d2',
      600: '#0552b5',
      700: '#03449e',
      800: '#01337d',
      900: '#002159',
    },
    risk: {
      low: '#c6f6d5',
      medium: '#feebc8',
      high: '#fed7d7',
      veryHigh: '#feb2b2',
    },
  },
  fonts: {
    heading: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    body: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          transition: 'all 0.3s ease',
        },
        secondary: {
          bg: 'gray.100',
          color: 'gray.800',
          _hover: {
            bg: 'gray.200',
          },
        },
      },
    },
    Box: {
      variants: {
        card: {
          p: 5,
          borderRadius: 'md',
          bg: 'white',
          boxShadow: 'md',
          transition: 'all 0.3s ease',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        },
        resultCard: {
          p: 4,
          borderRadius: 'md',
          boxShadow: 'sm',
          borderWidth: '1px',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
});

export default theme;
