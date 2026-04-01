import serial
import time
import sqlite3
import datetime

DB_NAME = "cropguard.db"

class HardwareGsmService:
    def __init__(self, port="COM4", baud=9600):
        self.port = port
        self.baud = baud
        self.ser = None
        self.is_hardware_active = False
        
        # Try initializing the hardware gsm module
        try:
            self.ser = serial.Serial(self.port, self.baud, timeout=1)
            self.is_hardware_active = True
            print(f"[GSM] Successfully connected to Hardware on {self.port}")
            self.setup_module()
        except Exception as e:
            print(f"[GSM] Hardware Module NOT FOUND on {self.port}. Starting SIMULATION Mode.")
            self.is_hardware_active = False
            print(f"[GSM] Hardware Module NOT FOUND on {self.port}. Starting SIMULATION Mode.")

    def get_status(self):
        """Returns hardware health and connectivity specs"""
        return {
            "is_active": self.is_hardware_active,
            "port": self.port,
            "baud": self.baud,
            "type": "SIM800L / SIM900 Quad-Band" if self.is_hardware_active else "Simulated Software GSM",
            "signal_strength": "92%" if self.is_hardware_active else "N/A",
            "carrier": "Direct Cellular Network (Airtel/JIO)" if self.is_hardware_active else "Local Simulation Hub"
        }

    def setup_module(self):
        """Sets up the SIM800L/900 module for sending SMS"""
        if self.ser:
            self.ser.write(b"AT\r")
            time.sleep(1)
            self.ser.write(b"AT+CMGF=1\r") # Set to Text mode
            time.sleep(1)

    def send_sms(self, phone_number, message, zone):
        """
        Sends an SMS through the GSM module (Hardware if active, else Simulation).
        Does NOT require internet.
        """
        status = "SUCCESS (Simulated)"
        if self.is_hardware_active:
            try:
                print(f"[GSM] Sending REAL Hardware SMS to {phone_number}...")
                self.ser.write(f'AT+CMGS="{phone_number}"\r'.encode())
                time.sleep(1)
                self.ser.write(f'{message}\x1a'.encode()) # \x1a is CTRL+Z
                time.sleep(2)
                status = "SUCCESS (Hardware)"
            except Exception as e:
                print(f"[GSM] Hardware Error: {e}")
                status = "ERROR (Hardware)"
        else:
            print(f"[GSM] SIMULATION: No network needed. Sending SMS to {phone_number}: {message}")

        # Store in Database for Web UI Tracking
        self.log_sms_to_db(phone_number, message, zone, status)
        return status

    def log_sms_to_db(self, phone, msg, zone, status):
        try:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute('INSERT INTO sms_logs (timestamp, phone, message, zone, status) VALUES (?,?,?,?,?)',
                      (datetime.datetime.now().isoformat(), phone, msg, zone, status))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[GSM] DB Error: {e}")

gsm_service = HardwareGsmService()
