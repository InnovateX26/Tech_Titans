from flask import Blueprint, jsonify

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/weather', methods=['GET'])
def get_weather():
    """Returns local weather context (High-fidelity Mock for demo)"""
    return jsonify({
        "temp": 32.4,
        "humidity": 65,
        "condition": "Partly Cloudy",
        "advisory": "\u26A0\uFE0F High humidity in Zone 5. Keep monitoring for Whitefly winged-beats.",
        "forecast": "Scattered rain expected in next 48 hours."
    })
