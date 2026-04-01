from flask import Blueprint, Response
import sqlite3
import io
import csv

report_bp = Blueprint('report', __name__)
DB_NAME = "cropguard.db"

@report_bp.route('/export', methods=['GET'])
def export_csv():
    """Generates a CSV report of all detections"""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('SELECT * FROM detections ORDER BY id DESC')
    rows = c.fetchall()
    conn.close()

    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['ID', 'Timestamp', 'Zone', 'Temp (C)', 'Freq (Hz)', 'Amp (mV)', 'Duration (ms)', 'Rate/min', 'Prediction', 'Confidence'])
    cw.writerows(rows)
    
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=cropguard_report.csv"}
    )
