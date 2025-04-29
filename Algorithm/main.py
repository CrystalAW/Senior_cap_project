#built off of the quick start file

import datetime
import os.path
from eventFunction import *
from taskFunction import *
from gptConnection import *
from script import *

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar", 'https://www.googleapis.com/auth/tasks']

def main():
  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
      flow = InstalledAppFlow.from_client_secrets_file(
          "credentials.json", SCOPES
      )
      creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())
#Do not change above here

  try:
    now = datetime.datetime.now(datetime.timezone.utc)
    tomorrow_end = (now + datetime.timedelta(days=7)).replace(hour=23, minute=59, second=59)
    time_max = tomorrow_end.isoformat()
    reset(creds, time_max, "America/New_York")
    '''
    task_service = build('tasks', 'v1', credentials=creds)
    allTasks = getTasks(task_service, time_max)
    taskswithTime = []
    for task in allTasks:
      taskswithTime.append((task, 8))
    addNotes = "I need to go to bed at midnight"
    createSchedule(creds, taskswithTime, addNotes, time_max, tz = "America/New_York")
    '''
  except HttpError as error:
        print(f"An error occurred: {error}")
if __name__ == "__main__":
  main()


'''
    event_service = build("calendar", "v3", credentials=creds)
    task_service = build('tasks', 'v1', credentials=creds)
    tz="America/New_York"
    now = datetime.datetime.now(datetime.timezone.utc)
    tomorrow_end = (now + datetime.timedelta(days=1)).replace(hour=23, minute=59, second=59)
    time_min = now.isoformat()
    time_max = tomorrow_end.isoformat()

    events = getEvents(event_service, time_max, time_min)
    eventStr = listEventsAsString(events)
    #print(eventStr)

    #and tasks(adding one)
    title = "Finish Capstone Write-up"
    notes = "Final draft due tomorrow!"
    due = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    due_iso = due.isoformat("T") + "Z"
    task = createTask(title, notes, due_iso)
    task = task_service.tasks().insert(tasklist= '@default', body=task).execute()
    print ('Task created: %s' % (task['id']))
    #create a new task with the time breakdown
    tb = createTaskBreakdown(task, 3)
    tb = task_service.tasks().insert(tasklist= '@default', body=tb).execute()
    print ('Task created: %s' % (tb['id']))

    tasks = getTasks(task_service, time_max)
    taskStr = listTasksAsStringBD(tasks)
    #print(taskStr)
    thePrompt = buildPrompt(eventStr, taskStr, "")  
    print(thePrompt)
    output = gptPrompt(thePrompt)
    print(output)
    #NOT running over and over to save time:
    #current output
    #output = "Finish Capstone Write-up,1,2025-04-15T18:00:00-04:00,,Finish Capstone Write-up,1,2025-04-15T19:00:00-04:00,,Finish Capstone Write-up,1,2025-04-15T20:00:00-04:00,,"
    lexOutput(output, event_service, task_service, tasks, tz)
    '''
#tests to copy/paste into main
#my test: add event

'''
startTime = '2026-05-28T09:00:00-07:00'
endTime = '2026-05-28T17:00:00-07:00'
event = createEvent('My Event', 'Anne-Belk Hall', 'class time', startTime, endTime, 'America/New_York')
event = event_service.events().insert(calendarId='primary', body=event).execute()
print ('Event created: %s' % (event.get('htmlLink')))
'''
#my test: add a task
'''
title = "Finish Capstone Write-up"
notes = "Final draft due tomorrow!"
due = datetime.utcnow() + timedelta(days=1)
due_iso = due.isoformat("T") + "Z"
task = createTask(title, notes, due_iso)
task = task_service.tasks().insert(tasklist= '@default', body=task).execute()
print ('Task created: %s' % (task.get('htmlLink')))
#Running for calendar lists:
'''
#list all calenders
'''
page_token = None
while True:
  calendar_list = service.calendarList().list(pageToken=page_token).execute()
  for calendar_list_entry in calendar_list['items']:
    print(calendar_list_entry['summary'])
  page_token = calendar_list.get('nextPageToken')
  if not page_token:
    break
'''

'''
now = datetime.datetime.now(tz=datetime.timezone.utc)
tomorrow_end = (now + datetime.timedelta(days=1)).replace(hour=23, minute=59, second=59)
time_min = now.isoformat()
time_max = tomorrow_end.isoformat()

getEvents(event_service, time_max)
'''

#Start of test: create a Task with time associated and create an event with time blocked out
'''
#Create the task
title = "Finish Capstone Write-up"
notes = "Final draft due tomorrow!"
due = datetime.datetime.utcnow() + datetime.timedelta(days=1)
due_iso = due.isoformat("T") + "Z"
task = createTask(title, notes, due_iso)
task = task_service.tasks().insert(tasklist= '@default', body=task).execute()
print ('Task created: %s' % (task['id']))
#create a new task with the time breakdown
tb = createTaskBreakdown(task, 3)
tb = task_service.tasks().insert(tasklist= '@default', body=tb).execute()
print ('Task created: %s' % (tb['id']))
#now make a new event from this task
eventFromTask = createEventFromTask(tb, 1, '2025-04-28T09:00:00-07:00', 'America/New_York')
eventFromTask = event_service.events().insert(calendarId='primary', body=eventFromTask).execute()
#update the taskBreakdown
tb = task_service.tasks().update(tasklist='@default', task=tb['id'], body = tb).execute()
print ('Event created: %s' % (eventFromTask.get('htmlLink')))
'''
#End of test: create a Task with time associated and create an event with time blocked out