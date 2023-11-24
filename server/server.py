from __future__ import print_function
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os.path

with (open('server_scopes', 'r') as scopes):
    SCOPES = scopes.read().splitlines()

gcID = '629265502936'
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def create(data):
    creds = None

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('classroom', 'v1', credentials=creds)

    try:
        print(data)
        created_assignment = service.courses().courseWork().create(
            courseId=gcID, body=data).execute()
        print('Assignment created:')
        print('Title: {}'.format(created_assignment['title']))
        print('ID: {}'.format(created_assignment['id']))
        return 0

    except HttpError as error:
        print('An error occurred: %s' % error)
        return 1


def edit(assignmentID, data):
    creds = None

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('classroom', 'v1', credentials=creds)

    try:
        print(data)
        update_mask = "title,description,dueDate,dueTime"

        edited_assignment = service.courses().courseWork().patch(
            courseId=gcID,
            id=assignmentID,
            body=data,
            updateMask=update_mask
        ).execute()

        print('Assignment edited:')
        print('Title: {}'.format(edited_assignment['title']))
        print('ID: {}'.format(edited_assignment['id']))
        return 0

    except HttpError as error:
        print('An error occurred: %s' % error)
        return 1


def delete(assignmentID):
    creds = None

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('classroom', 'v1', credentials=creds)

    try:
        service.courses().courseWork().delete(
            courseId=gcID, id=assignmentID).execute()
        print('Assignment deleted')
        return 0

    except HttpError as error:
        print('An error occurred: %s' % error)
        return 1


@app.route('/create', methods=['POST'])
def reciveCreateAssignment():
    try:
        data = request.get_json()
        returnCode = create(data)
        return jsonify({"result_code": returnCode})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"result_code": 1})


@app.route('/edit', methods=['POST'])
def reciveEditAssignment():
    try:
        data = request.get_json()
        retunrCode = edit(data['id'], data)
        return jsonify({"result_code": retunrCode})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"result_code": 1})


@app.route('/delete', methods=['POST'])
def reciveDeleteAssignment():
    try:
        data = request.get_json()
        retunrCode = delete(data['id'])
        return jsonify({"result_code": retunrCode})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"result_code": 1})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
