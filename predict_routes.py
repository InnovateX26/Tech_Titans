from flask import Blueprint, request, jsonify
import sqlite3
import datetime
import random
from inference_engine import engine
from gsm_service import gsm_service

predict_bp = Blueprint('predict', __name__)
DB_NAME = "cropguard.db"

def handle_alert_sms(zone, pest, confidence):
    msg = f"[ALERT] {pest} in {zone}! Conf: {confidence:.1f}%. Please inspect crop ASAP."
    # Sending through hardware module (needs NO internet)
    gsm_service.send_sms("+919876543210", msg, zone)

@predict_bp.route('/predict', methods=['POST'])
def predict_pest():
    try:
        data = request.json
        zone = data.get('zone', 'Unknown')
        temp = float(data.get('temperature', 25.0))
        freq = float(data.get('frequency', 0.0))
        amp = float(data.get('amplitude', 0.0))
        dur = float(data.get('duration', 0.0))
        rate = float(data.get('rate', 0.0))

        prediction, confidence = engine.predict([temp, freq, amp, dur, rate])

        # Send Real-World SMS (Hardware Serial)
        if prediction in ['Locust Swarm', 'Stem Borer'] and confidence > 85:
            handle_alert_sms(zone, prediction, confidence)

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('''INSERT INTO detections 
                     (timestamp, zone, temperature, frequency, amplitude, duration, rate, prediction, confidence) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (datetime.datetime.now().isoformat(), zone, temp, freq, amp, dur, rate, prediction, confidence))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "zone": zone,
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@predict_bp.route('/history', methods=['GET'])
def get_history():
    limit = request.args.get('limit', 20)
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM detections ORDER BY id DESC LIMIT ?', (limit,))
        rows = c.fetchall()
        history = [dict(r) for r in rows]
        conn.close()
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@predict_bp.route('/simulate', methods=['GET'])
def simulate_detection():
    # Simple probability distribution for demo
    features = engine.generate_random_sensor_data()
    zone = f"Zone {random.randint(1, 12)}"
    prediction, confidence = engine.predict(features)

    # Log to DB
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('INSERT INTO detections (timestamp, zone, temperature, frequency, amplitude, duration, rate, prediction, confidence) VALUES (?,?,?,?,?,?,?,?,?)',
              (datetime.datetime.now().isoformat(), zone, features[0], features[1], features[2], features[3], features[4], prediction, confidence))
    conn.commit()
    conn.close()

    if prediction in ['Locust Swarm', 'Stem Borer'] and confidence > 85:
        handle_alert_sms(zone, prediction, confidence)

    return jsonify({"status": "success", "zone": zone, "prediction": prediction, "confidence": round(confidence, 2)})
