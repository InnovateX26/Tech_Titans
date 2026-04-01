import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import sys

# Ensure emojis encode correctly on Windows standard output
sys.stdout.reconfigure(encoding='utf-8')

# ==========================================
# CROP-GUARD: Piezoelectric Insect Detection ML Model
# Updated with real environmental/temperature data
# ==========================================

print("📥 Loading real environmental data from Multiscale_Ulva...")
data_path = r'c:/Users/techp/Downloads/crop/Multiscale_Ulva-master/data/ims_T_data_2017.csv'

try:
    # Read the real meteorological dataset
    real_env_df = pd.read_csv(data_path, encoding='latin1')
    temp_col = [c for c in real_env_df.columns if 'Temperature' in c][0]
    
    # We will sample 1500 valid temperature readings for our robust ML dataset
    real_env_df = real_env_df.dropna(subset=[temp_col])
    sampled_temps = real_env_df[temp_col].sample(n=1500, random_state=42).values
    print(f"✅ Successfully loaded {len(sampled_temps)} real temperature records.")
except Exception as e:
    print(f"❌ Error loading real data from {data_path}: {e}")
    print("⚠️ Using synthetic temperature fallback instead.")
    np.random.seed(42)
    sampled_temps = np.random.normal(loc=25, scale=5, size=1500)

print("🔬 Merging environmental data with Pest Frequency Domain inputs...")
np.random.seed(42)

def generate_pest_entry(temp):
    """
    Given a real environmental temperature, map it to a probable pest occurrence
    and generate its corresponding frequency domain input (Hz) and acoustic features.
    """
    if temp < 10 or temp > 40:
        # Extreme temperatures -> very low insect activity (Healthy/Wind)
        return 'None (Wind/Rain)', np.random.uniform(10, 50), np.random.uniform(0.1, 1.0), np.random.uniform(5, 20), np.random.uniform(1, 10)
    elif 15 <= temp <= 25:
        # Aphids thrive here
        if np.random.rand() > 0.4:
            return 'Aphid Colony', np.random.uniform(300, 600), np.random.uniform(0.5, 2.0), np.random.uniform(10, 40), np.random.uniform(200, 500)
    elif 20 <= temp <= 30:
        # Stem Borers thrive here
        if np.random.rand() > 0.5:
            return 'Stem Borer', np.random.uniform(80, 150), np.random.uniform(1.5, 4.0), np.random.uniform(100, 300), np.random.uniform(5, 20)
    elif 28 <= temp <= 38:
        # Locusts thrive in hot weather
        if np.random.rand() > 0.3:
            return 'Locust Swarm', np.random.uniform(150, 300), np.random.uniform(3.0, 8.0), np.random.uniform(30, 80), np.random.uniform(50, 150)
            
    # Default fallback to healthy
    return 'None (Wind/Rain)', np.random.uniform(10, 50), np.random.uniform(0.1, 1.0), np.random.uniform(5, 20), np.random.uniform(1, 10)

# Apply mapping to generate targeted rows integrating real environmental parameters
dataset_rows = []
for temp in sampled_temps:
    pest_label, freq, amp, dur, rate = generate_pest_entry(temp)
    dataset_rows.append({
        'Temperature_C': temp,
        'Frequency_Hz': freq,       # Input from frequency domain
        'Amplitude_mV': amp,
        'Duration_ms': dur,
        'Event_Rate': rate,
        'Pest_Type': pest_label
    })

df = pd.DataFrame(dataset_rows)

print("✅ Data Generation & Merge Complete")
print(f"Total structured samples: {len(df)}")
print("-" * 50)

# 2. Preprocessing
X = df[['Temperature_C', 'Frequency_Hz', 'Amplitude_mV', 'Duration_ms', 'Event_Rate']]
y = df['Pest_Type']

# Split into 80% training data and 20% testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Model Training
print("🚀 Training Machine Learning Model (Random Forest Classifier)...")
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
print("\n🔍 Feature Importance (Influence weights for prediction):")
print(importance_df.to_string(index=False))
print("-" * 50)

# 6. Save Model
model_filename = "cropguard_pest_model.pkl"
joblib.dump(model, model_filename)
print(f"\n💾 Model successfully saved as '{model_filename}' for production deployment.")

# 7. Demo Prediction Function
def simulate_live_sensor(temp, freq, amp, dur, rate):
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore") # Ignore feature name warnings for clean output
        prediction = model.predict([[temp, freq, amp, dur, rate]])[0]
        probabilities = model.predict_proba([[temp, freq, amp, dur, rate]])[0]
        confidence = max(probabilities) * 100
    
    print(f"\n📡 [LIVE SENSOR SIMULATION] Env Temp: {temp:.1f}°C | Freq: {freq:3.0f}Hz | Amp: {amp:.1f}mV | Dur: {dur:2.0f}ms | Rate: {rate:3.0f}/m")
    print(f"   🚨 ALARM TRIGGERED: {prediction} (Confidence: {confidence:.2f}%)")

print("\n--- RUNNING LIVE DEMOS CROP-GUARD MULTI-INPUT ---")
simulate_live_sensor(32.5, 210, 5.5, 45, 120)  # High temp, locust freq
simulate_live_sensor(12.0, 25, 0.5, 10, 5)     # Low temp, wind freq
simulate_live_sensor(22.4, 450, 1.2, 25, 300)  # Mild temp, aphid freq
