import sys
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

with (open('client_scopes', 'r') as scopes):
    SCOPES = scopes.read().splitlines()

gcID = '629265502936'

assignmentList = []

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

if len(sys.argv) > 1:
    assignmentID = sys.argv[1]
    try:
        courses = service.courses().list().execute()
        for course in courses.get('courses', []):
            course_id = course['id']

            assignments = service.courses().courseWork().list(
                courseId=course_id).execute()

            for item in assignments.get('courseWork', []):
                if item['id'] == assignmentID:
                    result = [item['id'], item['title'], item['description'], item['dueDate'], item['dueTime']]
                    print(result)

    except HttpError as error:
        print(error)
        exit(1)
else:
    print("Assignment ID not provided.")
    exit(1)
