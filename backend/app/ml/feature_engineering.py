import numpy as np
from typing import Dict, Any, List


FEATURE_NAMES = [
    "vibration",
    "tilt",
    "moisture",
    "temperature",
    "strain",
    "displacement",
    "rainfall",
    "humidity",
    "wind_speed",
    "groundwater_level",
    "seismic_activity",
]


def extract_features(
    sensor_data: Dict[str, Any] = None,
    weather_data: Dict[str, Any] = None,
    indian_conditions: Dict[str, Any] = None,
) -> np.ndarray:
    sensor_data = sensor_data or {}
    weather_data = weather_data or {}
    indian_conditions = indian_conditions or {}

    vibration = float(sensor_data.get("vibration", 0.4))
    tilt = float(sensor_data.get("tilt", 2.1))
    moisture = float(sensor_data.get("moisture", 63.0))
    temperature = float(sensor_data.get("temperature", 38.0))
    strain = float(sensor_data.get("strain", 2.2))
    displacement = float(sensor_data.get("displacement", 1.4))

    rainfall = float(weather_data.get("rainfall", 45.0))
    humidity = float(weather_data.get("humidity", 78.0))
    wind_speed = float(weather_data.get("wind_speed", 18.0))

    groundwater = float(indian_conditions.get("groundwater_level", 4.5))

    seismic_raw = str(indian_conditions.get("seismic_activity_level", "Low")).lower()
    if seismic_raw == "high":
        seismic = 3.0
    elif seismic_raw == "medium" or seismic_raw == "moderate":
        seismic = 2.0
    else:
        seismic = 1.0

    features = [
        vibration,
        tilt,
        moisture,
        temperature,
        strain,
        displacement,
        rainfall,
        humidity,
        wind_speed,
        groundwater,
        seismic,
    ]

    return np.array([features], dtype=np.float32)
