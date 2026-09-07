import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_FILE = os.path.join(MODEL_DIR, "rockfall_model.pkl")


def generate_synthetic_dataset(samples=2000):
    np.random.seed(42)

    # Features: [vibration, tilt, moisture, temp, strain, disp, rain, hum, wind, groundwater, seismic]
    vibration = np.random.uniform(0.0, 3.0, samples)
    tilt = np.random.uniform(0.0, 10.0, samples)
    moisture = np.random.uniform(20.0, 100.0, samples)
    temperature = np.random.uniform(15.0, 50.0, samples)
    strain = np.random.uniform(0.0, 8.0, samples)
    displacement = np.random.uniform(0.0, 15.0, samples)
    rainfall = np.random.uniform(0.0, 150.0, samples)
    humidity = np.random.uniform(30.0, 100.0, samples)
    wind_speed = np.random.uniform(0.0, 60.0, samples)
    groundwater = np.random.uniform(1.0, 20.0, samples)
    seismic = np.random.choice([1.0, 2.0, 3.0], size=samples, p=[0.7, 0.2, 0.1])

    X = np.column_stack([
        vibration, tilt, moisture, temperature, strain,
        displacement, rainfall, humidity, wind_speed, groundwater, seismic
    ])

    # Rule-based target generation for high accuracy synthetic model
    risk_score = (
        (vibration / 3.0) * 0.25 +
        (tilt / 10.0) * 0.25 +
        (displacement / 15.0) * 0.25 +
        (moisture / 100.0) * 0.15 +
        (rainfall / 150.0) * 0.10
    )
    # Add small noise
    risk_score += np.random.normal(0, 0.05, samples)

    # Class 1 = High/Critical Risk (score > 0.45)
    y = (risk_score > 0.45).astype(int)

    return X, y


def train_and_save_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    X, y = generate_synthetic_dataset(2500)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))

    model_metadata = {
        "model": clf,
        "accuracy_score": acc,
        "version": "1.2.0-synthetic",
        "training_samples": len(X_train),
        "is_synthetic": True,
    }

    joblib.dump(model_metadata, MODEL_FILE)
    print(f"[Training] Model saved to {MODEL_FILE} with accuracy: {acc * 100:.2f}%")
    return acc


if __name__ == "__main__":
    train_and_save_model()
