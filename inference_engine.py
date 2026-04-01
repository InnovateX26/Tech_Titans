import joblib
import random
import datetime
import sqlite3

class InferenceEngine:
    def __init__(self, model_path="cropguard_pest_model.pkl"):
        try:
            self.model = joblib.load(model_path)
            print(f"[LOADED] Inference Engine initialized with {model_path}")
        except Exception as e:
            self.model = None
            print(f"[ERROR] Failed to load model: {e}")

    def predict(self, features):
        if self.model:
            prediction = self.model.predict([features])[0]
            probability = self.model.predict_proba([features])[0]
            confidence = float(max(probability)) * 100
            return prediction, confidence
        return "Unknown", 0.0

    def generate_random_sensor_data(self):
        r = random.random()
        if r > 0.8: # Locust
            return [random.uniform(30, 38), random.uniform(150, 300), random.uniform(3, 8), random.uniform(30, 80), random.uniform(50, 150)]
        elif r > 0.6: # Aphid
            return [random.uniform(18, 26), random.uniform(300, 600), random.uniform(0.5, 2), random.uniform(10, 40), random.uniform(200, 500)]
        elif r > 0.4: # Borer
            return [random.uniform(22, 32), random.uniform(80, 150), random.uniform(1.5, 4), random.uniform(100, 300), random.uniform(5, 20)]
        else: # Healthy
            return [random.uniform(15, 35), random.uniform(10, 50), random.uniform(0.1, 1), random.uniform(5, 20), random.uniform(1, 10)]

engine = InferenceEngine()
