from flask import Blueprint, request, jsonify
import sqlite3

auth_bp = Blueprint('auth', __name__)
DB_NAME = "cropguard.db"

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
                  (name, email, phone, password))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "User registered successfully"})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Email already exists"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
    user = c.fetchone()
    conn.close()

    if user:
        return jsonify({"status": "success", "user": {"name": user[1], "email": user[2]}})
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401
