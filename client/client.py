from __future__ import print_function
import os
import os.path
import sys
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

with (open('client_scopes', 'r') as scopes):
    SCOPES = scopes.read().splitlines()

gcID = '629265502936'


def main():
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('../token.json'):
        creds = Credentials.from_authorized_user_file('../token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '../credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('../token.json', 'w') as token:
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
            if gcID in course['id']:
                announcements = service.courses().announcements().list(courseId=gcID).execute()
                announcement_items = announcements.get('announcements', [])

                course_work = service.courses().courseWork().list(courseId=gcID).execute()
                course_work_items = course_work.get('courseWork', [])

                if not announcement_items:
                    print('No announcements found for this course.')
                else:
                    # Sort announcements by creation time in descending order to get the most recent one.
                    sorted_announcements = sorted(announcement_items, key=lambda x: x['creationTime'], reverse=True)
                    most_recent_announcement = sorted_announcements[0]

                    print(most_recent_announcement)

                    print('Most Recent Announcement:')
                    print(most_recent_announcement['text'])
                    print('Creation Time:', most_recent_announcement['creationTime'])

                if not course_work_items:
                    print('No course work found for this course.')
                else:
                    print('Course Work:')
                    print(course_work_items)
                    print(len(course_work_items))
                    for work_item in course_work_items:
                        print('Title:', work_item['title'])
                        print('Description:', work_item['description'])
                        print('Due Date:', work_item['dueDate'])

    except HttpError as error:
        print('An error occurred: %s' % error)

    print("True")
