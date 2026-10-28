import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os


def train_model():
    np.random.seed(42)
    n_samples = 500

    data = pd.DataFrame({
        "distance_km": np.random.uniform(5, 500, n_samples),
        "vehicle_type": np.random.choice(["truck", "van", "car", "motorbike"], n_samples),
        "traffic_level": np.random.choice(["light", "medium", "heavy", "severe"], n_samples),
        "weather": np.random.choice(["clear", "rain", "fog"], n_samples),
    })

    vehicle_speed = {"truck": 50, "van": 60, "car": 70, "motorbike": 45}
    traffic_factor = {"light": 1.2, "medium": 1.0, "heavy": 0.7, "severe": 0.4}
    weather_factor = {"clear": 1.0, "rain": 0.85, "fog": 0.75}

    data["delivery_minutes"] = data.apply(
        lambda row: (row["distance_km"] / vehicle_speed[row["vehicle_type"]])
        / (traffic_factor[row["traffic_level"]] * weather_factor[row["weather"]])
        * 60 + np.random.normal(0, 5),
        axis=1
    )

    le_vehicle = LabelEncoder()
    le_traffic = LabelEncoder()
    le_weather = LabelEncoder()

    X = data[["distance_km", "vehicle_type", "traffic_level", "weather"]].copy()
    X["vehicle_type"] = le_vehicle.fit_transform(X["vehicle_type"])
    X["traffic_level"] = le_traffic.fit_transform(X["traffic_level"])
    X["weather"] = le_weather.fit_transform(X["weather"])

    y = data["delivery_minutes"].values

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X.values, y)

    model_data = {
        "model": model,
        "le_vehicle": le_vehicle,
        "le_traffic": le_traffic,
        "le_weather": le_weather
    }

    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump(model_data, model_path)

    score = model.score(X.values, y)
    print(f"Model trained. R2 Score: {score:.4f}")
    print(f"Model saved to: {model_path}")

    return model_data


if __name__ == "__main__":
    train_model()
