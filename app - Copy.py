from flask import Flask, send_from_directory
from flask_cors import CORS
import sqlite3
import sys

# Ensure emojis encode correctly on Windows standard output
sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_NAME = "cropguard.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Detections table
    c.execute('''CREATE TABLE IF NOT EXISTS detections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    zone TEXT,
                    temperature FLOAT,
                    frequency FLOAT,
                    amplitude FLOAT,
                    duration FLOAT,
                    rate FLOAT,
                    prediction TEXT,
                    confidence FLOAT
                )''')
    # Users table for Auth
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    phone TEXT,
                    password TEXT
                )''')
    # SMS Logs for GSM Tracking
    c.execute('''CREATE TABLE IF NOT EXISTS sms_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    phone TEXT,
                    message TEXT,
                    zone TEXT,
                    status TEXT
                )''')
    conn.commit()
    conn.close()

from gsm_service import gsm_service

# --- ROUTES ---

@app.route('/api/gsm-status')
def get_gsm_status():
    return gsm_service.get_status()

@app.route('/')
def serve_login():
    return send_from_directory('.', 'login.html')

@app.route('/dashboard')
def serve_dashboard():
    return send_from_directory('.', 'index.html')

# --- MODULES REGISTRATION (BLUEPRINTS) ---
from auth_routes import auth_bp
from weather_routes import weather_bp
from report_routes import report_bp
from predict_routes import predict_bp

app.register_blueprint(auth_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(report_bp)
app.register_blueprint(predict_bp)

@app.route('/api/sms-logs', methods=['GET'])
def get_sms_logs():
    limit = request.args.get('limit', 5)
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM sms_logs ORDER BY id DESC LIMIT ?', (limit,))
        rows = c.fetchall()
        logs = [dict(r) for r in rows]
        conn.close()
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    print("[SUCCESS] CropGuard Enterprise Hub initialized.")
    print("Serving Blueprints: [Auth, Weather, Reports, Sensing]")
    app.run(debug=True, port=5000)
