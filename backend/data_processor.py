"""
Data preprocessing module for the Heart Disease Prediction project.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self, config):
        self.config = config
        self.scaler = StandardScaler()
        
    def load_data(self):
        """Load the heart disease dataset."""
        try:
            logger.info(f"Loading data from {self.config.DATA_PATH}")
            df = pd.read_csv(self.config.DATA_PATH)
            logger.info(f"Loaded dataset with shape {df.shape}")
            return df
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def profile_data(self, df):
        """Generate a basic profile of the dataset."""
        logger.info("Generating data profile...")
        
        # Basic statistics
        logger.info(f"Dataset shape: {df.shape}")
        logger.info(f"Columns: {df.columns.tolist()}")
        
        # Check for missing values
        missing_values = df.isnull().sum()
        if missing_values.sum() > 0:
            logger.warning(f"Missing values found:\n{missing_values[missing_values > 0]}")
        else:
            logger.info("No missing values found.")
        
        # Check for duplicates
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            logger.warning(f"Found {duplicates} duplicate rows.")
        else:
            logger.info("No duplicate rows found.")
        
        # Data types
        logger.info(f"Data types:\n{df.dtypes}")
        
        # Basic statistics for numerical columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        logger.info(f"Numerical columns statistics:\n{df[numeric_cols].describe()}")
        
        # Value counts for categorical columns
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns
        if not categorical_cols.empty:
            for col in categorical_cols:
                logger.info(f"Value counts for {col}:\n{df[col].value_counts()}")
        
        return df
    
    def clean_data(self, df):
        """Clean the dataset by handling missing values and outliers."""
        logger.info("Cleaning dataset...")
        
        # Handle missing values if any
        if df.isnull().values.any():
            logger.info("Filling missing values...")
            # For numerical columns, fill with median
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if df[col].isnull().sum() > 0:
                    df[col] = df[col].fillna(df[col].median())
            
            # For categorical columns, fill with mode
            categorical_cols = df.select_dtypes(exclude=[np.number]).columns
            for col in categorical_cols:
                if df[col].isnull().sum() > 0:
                    df[col] = df[col].fillna(df[col].mode()[0])
        
        # Handle outliers using IQR method for numerical columns
        logger.info("Handling outliers...")
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if self.config.TARGET_COLUMN in numeric_cols:
            numeric_cols.remove(self.config.TARGET_COLUMN)  # Don't modify target
        
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Count outliers
            outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
            if outliers > 0:
                logger.info(f"Found {outliers} outliers in column {col}")
                # Cap the outliers
                df[col] = df[col].clip(lower=lower_bound, upper=upper_bound)
        
        return df
    
    def engineer_features(self, df):
        """Create new features that might improve model performance."""
        logger.info("Engineering features...")
        
        # Example: Create age groups
        df['age_group'] = pd.cut(df['age'], bins=[0, 40, 50, 60, 100], 
                                labels=['<40', '40-50', '50-60', '>60'])
        
        # Example: Create interaction features
        df['thalach_age_ratio'] = df['thalach'] / df['age']  # Max heart rate to age ratio
        
        # Example: Create a feature for blood pressure category
        df['bp_category'] = pd.cut(df['trestbps'], bins=[0, 120, 140, 180, 300], 
                                 labels=['normal', 'prehypertension', 'hypertension', 'severe'])
        
        # Example: Create a feature for cholesterol category
        df['chol_category'] = pd.cut(df['chol'], bins=[0, 200, 240, 600], 
                                   labels=['normal', 'borderline', 'high'])
        
        # One-hot encode categorical features
        categorical_cols = ['age_group', 'bp_category', 'chol_category']
        df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
        
        logger.info(f"Dataset shape after feature engineering: {df.shape}")
        return df
    
    def prepare_data(self, df):
        """Prepare data for model training by splitting and scaling."""
        logger.info("Preparing data for modeling...")
        
        # Separate features and target
        X = df.drop(columns=[self.config.TARGET_COLUMN])
        y = df[self.config.TARGET_COLUMN]
        
        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.config.TEST_SIZE, random_state=self.config.RANDOM_SEED
        )
        
        logger.info(f"Training set shape: {X_train.shape}")
        logger.info(f"Testing set shape: {X_test.shape}")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train, X_test, X_train_scaled, X_test_scaled, y_train, y_test
    
    def process(self):
        """Execute the full data processing pipeline."""
        df = self.load_data()
        df = self.profile_data(df)
        df = self.clean_data(df)
        df = self.engineer_features(df)
        return self.prepare_data(df)
