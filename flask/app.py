import requests
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import h5py
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["*"],
        "allow_headers": ["*"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "X-CSRFToken"],
        "max_age": 3600
    }
})

# Global variables for fraud detection
fraud_model = None
scaler = None

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    response.headers.add('Access-Control-Allow-Methods', '*')
    return response

def load_fraud_model():
    global fraud_model, scaler
    try:
        fraud_model = joblib.load('model.pkl')
        scaler = joblib.load('scaler.pkl')
    except:
        train_fraud_model()

def train_fraud_model():
    global fraud_model, scaler
    
    fraud_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42
    )
    
    scaler = StandardScaler()
    
    joblib.dump(fraud_model, 'model.pkl')
    joblib.dump(scaler, 'scaler.pkl')

def preprocess_fraud_data(data):
    numerical_cols = [
        'Energy_Produced_kWh', 
        'Energy_Sold_kWh',
        'Price_per_kWh', 
        'Total_Amount', 
        'Energy_Consumption_Deviation'
    ]
    
    if isinstance(data, dict):
        data = pd.DataFrame([data])
    
    scaled_data = data.copy()
    scaled_data[numerical_cols] = scaler.transform(data[numerical_cols])
    
    return scaled_data

@app.route('/predict_energy', methods=['POST'])
def predict_energy():
    try:
        # Get data from request
        data = request.json
        location = data.get('location')
        area = float(data.get('area'))
        unit = float(data.get('unit'))

        # Load weather data
        df = pd.read_csv("weather.csv", sep=',', index_col=False)
        
        # Default coordinates (Paris)
        latitude = 48.8588443
        longitude = 2.2943506

        # Get latitude and longitude for the location
        location_row = df[df['city'] == location]
        if not location_row.empty:
            latitude = location_row.iloc[0]['lat']
            longitude = location_row.iloc[0]['lng']

        # Visual Crossing Weather API key and URL
        API_KEY = "AYXAQ2E9CFTNDAELE4FKAWKLG"
        BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
        url = f"{BASE_URL}/{latitude},{longitude}"
        
        params = {
            "key": API_KEY,
            "unitGroup": "metric",
            "include": "current",
        }

        response = requests.get(url, params=params)

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch weather data"}), 500

        weather_data = response.json()
        current_data = weather_data.get("currentConditions", {})

        # Extract weather information
        temperature = current_data.get("temp", 0)
        pressure = current_data.get("pressure", 0)
        cloud_cover = current_data.get("cloudcover", 0)
        wind_speed = current_data.get("windspeed", 0)
        solar_radiation = current_data.get("solarradiation", 0)

        # Calculate derived features
        temp_squared = temperature * temperature
        wind_speed_squared = wind_speed * wind_speed

        # Prepare the model input data
        model_input_data = {
            "Log_GHI": [np.log(solar_radiation + 1)],
            "Clouds_all": [cloud_cover],
            "Wind_speed": [wind_speed],
            "Wind_speed^2": [wind_speed_squared],
            "Temp": [temperature],
            "Temp^2": [temp_squared],
            "Pressure": [pressure],
            "Interaction_LogGHI_Clouds": [np.log(solar_radiation + 1) * cloud_cover],
        }
        model_input_df = pd.DataFrame(model_input_data)

        # Load energy weather data for model training
        df1 = pd.read_csv("energy_weather_data.csv")
        X = df1.iloc[:, [0, 1, 2, 3, 4, 5, 6, 7]]
        Y = df1.iloc[:, [8, 9]]

        # Train the Random Forest model
        X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)
        model = RandomForestRegressor()
        model.fit(X_train, Y_train)

        # Make prediction
        y_p = model.predict(model_input_df)

        # Convert area based on unit
        if unit == 1:  # Hectare
            area = area * 10000
        elif unit == 2:  # Acres
            area = area * 4046.85642

        # Scale predictions by area
        solar_energy = float(y_p[0, 0] * area)
        wind_energy = float(y_p[0, 1] * area)

        # Save the model and data
        joblib.dump(model, "random_forest_model.pkl")
        with h5py.File("model_and_data.h5", "w") as f:
            f.create_dataset("weather_data", data=df1.values)
            f.create_dataset("model_input_data", data=model_input_df.values)

        return jsonify({
            "solar-energy": solar_energy,
            "wind-energy": wind_energy
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict_fraud', methods=['POST'])
def predict_fraud():
    try:
        input_data = request.get_json()
        
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
        
        processed_data = preprocess_fraud_data(input_data)
        
        prediction = fraud_model.predict(processed_data)[0]
        probability = fraud_model.predict_proba(processed_data)[0][1]
        
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

@app.route('/batch_predict_fraud', methods=['POST'])
def batch_predict_fraud():
    try:
        input_data = request.get_json()
        
        if not isinstance(input_data, list):
            return jsonify({
                'error': 'Input must be a list of transactions'
            }), 400
        
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
        
        df = pd.DataFrame(input_data)
        processed_data = preprocess_fraud_data(df)
        
        predictions = fraud_model.predict(processed_data)
        probabilities = fraud_model.predict_proba(processed_data)[:, 1]
        
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
    if fraud_model is None:
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
            'n_estimators': fraud_model.n_estimators,
            'max_depth': fraud_model.max_depth,
            'min_samples_split': fraud_model.min_samples_split,
            'min_samples_leaf': fraud_model.min_samples_leaf
        }
    })

if __name__ == '__main__':
    # Load the fraud detection model when starting the application
    load_fraud_model()
    app.run(debug=True)