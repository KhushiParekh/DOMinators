import requests
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import h5py
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

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

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    response.headers.add('Access-Control-Allow-Methods', '*')
    return response
@app.route('/predict', methods=['POST'])
def predict():
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
        
        # Parameters for the API request
        params = {
            "key": API_KEY,
            "unitGroup": "metric",
            "include": "current",
        }

        # Make the API request
        response = requests.get(url, params=params)

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch weather data"}), 500

        # Parse the response
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
        # unit 3 is already in square meters

        # Scale predictions by area
        solar_energy = float(y_p[0, 0] * area)
        wind_energy = float(y_p[0, 1] * area)

        # Save the model and data (optional)
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

if __name__ == '__main__':
    app.run(debug=True)