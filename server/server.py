from __future__ import print_function

import os.path
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

with (open('server_scopes', 'r') as scopes):
    SCOPES = scopes.read().splitlines()


def jsonPushFormat(title, description, dueDate, student_email):
    assignment = {
        'title': title,
        'description': description,
        'state': 'PUBLISHED',
        'dueDate': {
            'year': dueDate[0],
            'month': dueDate[1],
            'day': dueDate[2],
        },
        'dueTime': {
            'hours': 23,
            'minutes': 59,
            'seconds': 59,
            'nanos': 0
        },
        'assigneeMode': 'INDIVIDUAL_STUDENTS',
        'individualStudentsOptions': {
            'studentIds': student_email
        },
        'submissionModificationMode': 'MODIFIABLE',
        'workType': 'ASSIGNMENT'
    }
    return assignment


def createAssignment(service, course_id, data):
    try:
        # assignment = jsonPushFormat(title, description, dueDate, student_email)
        assignment = json.loads(data)
        print(assignment)
        created_assignment = service.courses().courseWork().create(
            courseId=course_id, body=assignment).execute()
        print('Assignment created:')
        print('Title: {}'.format(created_assignment['title']))
        print('ID: {}'.format(created_assignment['id']))

    except HttpError as error:
        print('An error occurred: %s' % error)


def main(data):
    """Shows basic usage of the Classroom API.
    Prints the names of the first 10 courses the user has access to.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
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
        print(results)
        courses = results.get('courses', [])

        if not courses:
            print('No courses found.')
            return
        print('Courses:')
        for course in courses:
            print(course['name'])

    except HttpError as error:
        print('An error occurred: %s' % error)

    createAssignment(service, '629265502936', data)
