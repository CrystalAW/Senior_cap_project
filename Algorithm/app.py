import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2.credentials import Credentials
from script import createSchedule

app = Flask(__name__)
CORS(app)  # Allows cross-origin requests

@app.route('/schedule', methods=['POST'])
def schedule_tasks():
    data = request.get_json()
    try:
        print('Received payload:', data)
        # Extract data from POST request
        creds_dict = data.get('creds')
        taskBDTupleList = data.get('taskBDTupleList')
        additionalNotes = data.get('additionalNotes', '')
        endTime = data.get('endTime')
        tz = data.get('tz', 'America/New_York')

        # Convert credentials dictionary to Google Credentials object
        creds = Credentials.from_authorized_user_info(info=creds_dict)

        # Call the scheduling function
        createSchedule(creds, taskBDTupleList, additionalNotes, endTime, tz)

        return jsonify({"status": "success", "message": "Schedule created successfully."})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset():
    data = request.get_json()

    try:
        print('Received payload:', data)
        # Extract data from POST request
        creds_dict = data.get('creds')
        endTime = data.get('endTime')
        tz = data.get('tz', 'America/New_York')

        # Convert credentials dictionary to Google Credentials object
        creds = Credentials.from_authorized_user_info(info=creds_dict)

        # Call the scheduling function
        createSchedule(creds, endTime, tz)

        return jsonify({"status": "success", "message": "Schedule reset successfully."})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)