import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

app = Flask(__name__)

# Load the pre-trained model and scaler
model = None
scaler = None

def load_model():
    global model, scaler
    try:
        model = joblib.load('model.pkl')
        scaler = joblib.load('scaler.pkl')
    except:
        # If model doesn't exist, we'll train it
        train_model()

def train_model():
    global model, scaler
    
    # Initialize the model with best parameters from grid search
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42
    )
    
    # Initialize scaler
    scaler = StandardScaler()
    
    # Save the model and scaler
    joblib.dump(model, 'model.pkl')
    joblib.dump(scaler, 'scaler.pkl')

def preprocess_data(data):
    """Preprocess input data similar to training pipeline"""
    numerical_cols = [
        'Energy_Produced_kWh', 
        'Energy_Sold_kWh',
        'Price_per_kWh', 
        'Total_Amount', 
        'Energy_Consumption_Deviation'
    ]
    
    # Create DataFrame if input is dictionary
    if isinstance(data, dict):
        data = pd.DataFrame([data])
    
    # Scale numerical features
    scaled_data = data.copy()
    scaled_data[numerical_cols] = scaler.transform(data[numerical_cols])
    
    return scaled_data

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from request
        input_data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'Energy_Produced_kWh', 
            'Energy_Sold_kWh',
            'Price_per_kWh', 
            'Total_Amount', 
            'Energy_Consumption_Deviation',
            'Producer_Type',
            'Grid_Connection_Type',
            'Location_Type',
            'Weather_Conditions'
        ]
        
        for field in required_fields:
            if field not in input_data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Preprocess the data
        processed_data = preprocess_data(input_data)
        
        # Make prediction
        prediction = model.predict(processed_data)[0]
        probability = model.predict_proba(processed_data)[0][1]
        
        # Prepare response
        response = {
            'fraud_prediction': bool(prediction),
            'fraud_probability': float(probability),
            'threshold': 0.5,
            'input_data': input_data
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    try:
        # Get input data from request
        input_data = request.get_json()
        
        if not isinstance(input_data, list):
            return jsonify({
                'error': 'Input must be a list of transactions'
            }), 400
        
        # Validate each transaction
        required_fields = [
            'Energy_Produced_kWh', 
            'Energy_Sold_kWh',
            'Price_per_kWh', 
            'Total_Amount', 
            'Energy_Consumption_Deviation',
            'Producer_Type',
            'Grid_Connection_Type',
            'Location_Type',
            'Weather_Conditions'
        ]
        
        for idx, transaction in enumerate(input_data):
            for field in required_fields:
                if field not in transaction:
                    return jsonify({
                        'error': f'Missing required field: {field} in transaction at index {idx}'
                    }), 400
        
        # Convert to DataFrame and preprocess
        df = pd.DataFrame(input_data)
        processed_data = preprocess_data(df)
        
        # Make predictions
        predictions = model.predict(processed_data)
        probabilities = model.predict_proba(processed_data)[:, 1]
        
        # Prepare response
        response = {
            'predictions': [bool(p) for p in predictions],
            'probabilities': [float(p) for p in probabilities],
            'threshold': 0.5,
            'input_data': input_data
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Endpoint to get information about the model"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 500
        
    return jsonify({
        'model_type': 'Random Forest Classifier',
        'features': [
            'Energy_Produced_kWh', 
            'Energy_Sold_kWh',
            'Price_per_kWh', 
            'Total_Amount', 
            'Energy_Consumption_Deviation',
            'Producer_Type',
            'Grid_Connection_Type',
            'Location_Type',
            'Weather_Conditions'
        ],
        'parameters': {
            'n_estimators': model.n_estimators,
            'max_depth': model.max_depth,
            'min_samples_split': model.min_samples_split,
            'min_samples_leaf': model.min_samples_leaf
        }
    })

if __name__ == '__main__':
    # Load the model when starting the application
    load_model()
    app.run(debug=True)