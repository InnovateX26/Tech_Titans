import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# ==========================================
# CROP-GUARD: Piezoelectric Insect Detection ML Model
# Written for Hackathon Showcase
# ==========================================

# 1. Generate Synthetic Data for the Hackathon Showcase
# In a real scenario, this data comes from Piezoelectric sensors placed on plant stems.
# Features:
# - Frequency (Hz): Vibration frequency from the sensor (Different insects chew/move at different frequencies)
# - Amplitude (mV): Voltage generated from the vibration (Indicates the size/force of the insect)
# - Duration (ms): How long the vibration pulse lasts
# - Event_Rate (per min): How many vibrations per minute are detected (Indicates swarm size/activity level)

np.random.seed(42)

def generate_pest_data(num_samples, freq_range, amp_range, dur_range, rate_range, label):
    """Generates synthetic sensor data for specific pest profiles"""
    return pd.DataFrame({
        'Frequency_Hz': np.random.uniform(*freq_range, num_samples),
        'Amplitude_mV': np.random.uniform(*amp_range, num_samples),
        'Duration_ms': np.random.uniform(*dur_range, num_samples),
        'Event_Rate': np.random.uniform(*rate_range, num_samples),
        'Pest_Type': label
    })

# Define pest profiles based on bio-acoustics & plant vibrations
data_healthy = generate_pest_data(400, (10, 50), (0.1, 1.0), (5, 20), (1, 10), 'None (Wind/Rain)')
data_locust = generate_pest_data(350, (150, 300), (3.0, 8.0), (30, 80), (50, 150), 'Locust Swarm')
data_stem_borer = generate_pest_data(400, (80, 150), (1.5, 4.0), (100, 300), (5, 20), 'Stem Borer')
data_aphids = generate_pest_data(350, (300, 600), (0.5, 2.0), (10, 40), (200, 500), 'Aphid Colony')

# Combine and shuffle datasets
df = pd.concat([data_healthy, data_locust, data_stem_borer, data_aphids], ignore_index=True)
df = df.sample(frac=1).reset_index(drop=True)

print("✅ Data Generation Complete")
print(f"Total samples generated: {len(df)}")
print("-" * 50)

# 2. Preprocessing
X = df[['Frequency_Hz', 'Amplitude_mV', 'Duration_ms', 'Event_Rate']]
y = df['Pest_Type']

# Split into 80% training data and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Model Training
print("🚀 Training Machine Learning Model (Random Forest Classifier)...")
# Random Forest is ideal here because it's robust to noise and provides feature importance
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# 4. Evaluation
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n🏆 Model Accuracy: {accuracy * 100:.2f}%")
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# 5. Feature Importance
importances = model.feature_importances_
importance_df = pd.DataFrame({'Feature': X.columns, 'Importance': importances}).sort_values(by='Importance', ascending=False)
print("\n🔍 Feature Importance (What the model looks at most):")
print(importance_df.to_string(index=False))
print("-" * 50)

# 6. Save Model for the Web App backend (if needed later)
model_filename = "cropguard_pest_model.pkl"
joblib.dump(model, model_filename)
print(f"\n💾 Model successfully saved as '{model_filename}' for production deployment.")

# 7. Demo Prediction Function (For Hackathon Pitch)
def simulate_live_sensor(freq, amp, dur, rate):
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore") # Ignore feature name warnings for clean output
        prediction = model.predict([[freq, amp, dur, rate]])[0]
        probabilities = model.predict_proba([[freq, amp, dur, rate]])[0]
        confidence = max(probabilities) * 100
    
    print(f"\n📡 [LIVE SENSOR SIMULATION] Incoming Signal -> {freq}Hz | {amp}mV | {dur}ms | {rate} events/m")
    print(f"   🚨 ALARM TRIGGERED: {prediction} (Confidence: {confidence:.2f}%)")
    
print("\n--- RUNNING LIVE DEMOS ---")
simulate_live_sensor(210, 5.5, 45, 120)  # Simulating a Locust
simulate_live_sensor(25, 0.5, 10, 5)     # Simulating Wind
simulate_live_sensor(450, 1.2, 25, 300)  # Simulating Aphids
