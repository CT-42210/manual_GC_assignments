from __future__ import print_function
import os
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

gcID = '629265502936'

with (open('client_scopes', 'r') as scopes):
    SCOPES = scopes.read().splitlines()


def loginFileExec(username, useremail):
    file_name = "login"

    if os.path.exists(file_name):
        with open(file_name, 'r') as file:
            existing_email = file.readline().strip()
            existing_username = file.readline().strip()

        if username != existing_email or useremail != existing_username:
            with open(file_name, 'w') as file:
                file.write(username + "\n")
                file.write(useremail + "\n")
    else:
        with open(file_name, 'w') as file:
            file.write(username + "\n")
            file.write(useremail + "\n")


def login():
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
        results = service.courses().list(pageSize=10).execute()
        courses = results.get('courses', [])

        if not courses:
            print('No courses found.')
            return
        for course in courses:
            if gcID in course['id']:
                student_profile = service.userProfiles().get(userId='me').execute()
                username = student_profile.get('name').get('fullName')
                useremail = student_profile.get('emailAddress')

                loginFileExec(username, useremail)

                exit(0)

    except HttpError as error:
        print('An error occurred: %s' % error)


login()
