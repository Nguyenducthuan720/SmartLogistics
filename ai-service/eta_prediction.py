import math
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pickle
import os
from datetime import datetime, timedelta

MODEL_FILE = os.path.join(os.path.dirname(__file__), "model.pkl")

TRAFFIC_SPEED_FACTOR = {
    "light": 1.2,
    "medium": 1.0,
    "heavy": 0.7,
    "severe": 0.4
}

WEATHER_SPEED_FACTOR = {
    "clear": 1.0,
    "rain": 0.85,
    "heavy_rain": 0.65,
    "fog": 0.75,
    "storm": 0.5
}

VEHICLE_AVG_SPEED = {
    "truck": 50,
    "van": 60,
    "car": 70,
    "motorbike": 45,
    "bicycle": 20
}


def load_model():
    if os.path.exists(MODEL_FILE):
        with open(MODEL_FILE, "rb") as f:
            return pickle.load(f)
    return None


def save_model(model):
    with open(MODEL_FILE, "wb") as f:
        pickle.dump(model, f)


def predict_eta(distance_km, vehicle_type, traffic_level="medium", weather="clear", historical_minutes=None):
    traffic_factor = TRAFFIC_SPEED_FACTOR.get(traffic_level, 1.0)
    weather_factor = WEATHER_SPEED_FACTOR.get(weather, 1.0)
    avg_speed = VEHICLE_AVG_SPEED.get(vehicle_type, 50)

    effective_speed = avg_speed * traffic_factor * weather_factor
    estimated_hours = distance_km / max(effective_speed, 1)
    estimated_minutes = estimated_hours * 60

    if historical_minutes:
        weights = 0.4 if vehicle_type else 0.2
        estimated_minutes = historical_minutes * weights + estimated_minutes * (1 - weights)

    confidence = 85.0
    if traffic_level == "severe":
        confidence -= 10
    elif traffic_level == "light":
        confidence += 5

    if weather in ("heavy_rain", "storm"):
        confidence -= 10
    elif weather == "clear":
        confidence += 5

    if historical_minutes:
        confidence += 5

    confidence = max(50.0, min(98.0, confidence))

    eta = datetime.now() + timedelta(minutes=estimated_minutes)

    return {
        "predicted_eta": eta.isoformat(),
        "estimated_minutes": round(estimated_minutes, 1),
        "estimated_hours": round(estimated_hours, 2),
        "distance_km": distance_km,
        "effective_speed_kmh": round(effective_speed, 1),
        "confidence_score": round(confidence, 1),
        "factors": {
            "traffic": traffic_level,
            "traffic_factor": traffic_factor,
            "weather": weather,
            "weather_factor": weather_factor,
            "vehicle_type": vehicle_type,
            "vehicle_avg_speed": avg_speed
        }
    }


if __name__ == "__main__":
    result = predict_eta(100, "truck", "medium", "clear")
    print("ETA Prediction:", result)
