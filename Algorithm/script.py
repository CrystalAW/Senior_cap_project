import datetime
import os.path
from eventFunction import *
from taskFunction import *
from gptConnection import *

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

#creds: is the credentials path that is created through the code provided in googleCalendar API
#   This schould allow the SCOPES for both google calendar and google tasks.
#taskBDTupleList: is a list of tuples where the first elements is the task id that we want to add to a schedule,
#   and the second element is the amount of hours we want to allocate for the task.
#additionalNotes: is a string with any additional information the user wants to add about there schedule
#   that they want the machine to know when running the prompt
#endTime: is the end time of the time frame we wish to look at to plan out tasks
#   pass as a date time in iso format (if possible, lmk otherwise and I can change it here)
#tz: is the time zone (pass as string: ex "American/New_York")
def createSchedule(creds, taskBDTupleList, additionalNotes, endTime, tz):
    try:
        event_service = build("calendar", "v3", credentials=creds)
        task_service = build('tasks', 'v1', credentials=creds)
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        for task, time in taskBDTupleList:
            if 'notes' not in task or task['notes'] is None:
                task['notes'] = ""
            tb = createTaskBreakdown(task, time)
            task_service.tasks().insert(tasklist= '@default', body=tb).execute()

        events = getEvents(event_service, endTime, now)
        eventStr = listEventsAsString(events)
        tasks = getTasks(task_service, endTime)
        taskStr = listTasksAsStringBD(tasks)
        thePrompt = buildPrompt(eventStr, taskStr, additionalNotes, now)
        output = gptPrompt(thePrompt)
        lexOutput(output, event_service, task_service, tasks, tz)
    except HttpError as error:
        print(f"An error occurred: {error}")

def reset_schedule(creds, endTime):
    event_service = build("calendar", "v3", credentials=creds)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    events = getEvents(event_service, endTime, now)
    for event in events:
        if event["summary"].startswith("##BD##"):
            event_service.events().delete(calendarId='primary', eventId=event['id']).execute()
