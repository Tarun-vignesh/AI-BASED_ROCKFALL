from typing import Dict, Any, List
from app.ml.feature_engineering import extract_features
from app.ml.model import model_instance


def predict_rockfall_risk(
    sensor_data: Dict[str, Any] = None,
    weather_data: Dict[str, Any] = None,
    indian_conditions: Dict[str, Any] = None,
) -> Dict[str, Any]:
    sensor_data = sensor_data or {}
    weather_data = weather_data or {}
    indian_conditions = indian_conditions or {}

    features = extract_features(sensor_data, weather_data, indian_conditions)
    risk_prob, confidence, risk_level = model_instance.predict(features)

    # Derive human readable risk factors
    risk_factors = []
    recommendations = []
    indian_factors = []

    disp = float(sensor_data.get("displacement", 0))
    tilt = float(sensor_data.get("tilt", 0))
    vib = float(sensor_data.get("vibration", 0))
    rain = float(weather_data.get("rainfall", 0))
    moist = float(sensor_data.get("moisture", 0))

    if disp > 1.0:
        risk_factors.append(f"Elevated slope displacement rate ({disp} mm/hr)")
    if tilt > 2.0:
        risk_factors.append(f"High slope tilt angle change ({tilt}°)")
    if vib > 0.5:
        risk_factors.append(f"Micro-seismic vibration anomaly ({vib} g)")
    if rain > 30.0:
        risk_factors.append(f"Heavy precipitation / rainfall intensity ({rain} mm/hr)")

    if not risk_factors:
        risk_factors.append("Nominal slope stability parameters")

    # Derive recommendations
    if risk_level == "CRITICAL":
        recommendations.append("Immediate evacuation of active bench level")
        recommendations.append("Suspend haul truck operations along perimeter road")
        recommendations.append("Deploy automated laser scanning and continuous radar")
    elif risk_level == "HIGH":
        recommendations.append("Inspect affected slope crest for tension cracks")
        recommendations.append("Restrict personnel access to lower bench areas")
        recommendations.append("Increase piezometer and tilt sensor sampling rate")
    elif risk_level == "MODERATE":
        recommendations.append("Conduct visual inspection during routine shift change")
        recommendations.append("Monitor drainage channels for blockage")
    else:
        recommendations.append("Maintain routine monitoring schedule")

    # Indian-specific environmental factors
    geo = indian_conditions.get("geological_type", "Laterite")
    monsoon = indian_conditions.get("monsoon_season", True)
    humidity = indian_conditions.get("humidity_percent", 75)

    if monsoon:
        indian_factors.append("Monsoon seasonal saturation & pore water pressure build-up")
    if geo in ["Laterite", "Weathered Iron Ore"]:
        indian_factors.append(f"{geo} rock mass vulnerability to rapid softening")
    if humidity > 70:
        indian_factors.append(f"High tropical humidity ({humidity}%) accelerating slope erosion")

    return {
        "risk_probability": round(risk_prob, 3),
        "confidence_level": round(confidence, 3),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommendations": recommendations,
        "timeframe_hours": 6 if risk_level in ["CRITICAL", "HIGH"] else 24,
        "indian_specific_factors": indian_factors,
    }
