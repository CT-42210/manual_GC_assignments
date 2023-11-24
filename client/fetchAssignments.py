import os
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

try:
    # Get the list of courses
    courses = service.courses().list().execute()
    for course in courses.get('courses', []):
        course_id = course['id']

        # Get the list of assignments in the course
        assignments = service.courses().courseWork().list(
            courseId=course_id).execute()

        for item in assignments.get('courseWork', []):
            if item['state'] == 'PUBLISHED':
                assignmentData = [item['id'], item['title']]
                assignmentList.append(assignmentData)

        print(assignmentList)
except HttpError as error:
    print(error)
    exit(1)


