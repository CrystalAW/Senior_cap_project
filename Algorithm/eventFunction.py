#Functions relating to Events
from datetime import datetime, timedelta
from taskFunction import *

def createEvent(summary, location, description, start_datetime, end_datetime, timezone, recurrence=None, attendees=None, reminders=None):
    event = {
        'summary': summary,
        'location': location,
        'description': description,
        'start': {
            'dateTime': start_datetime,
            'timeZone': timezone,
        },
        'end': {
            'dateTime': end_datetime,
            'timeZone': timezone,
        },
        'recurrence': recurrence if recurrence else [],
        'attendees': [{'email': email} for email in (attendees if attendees else [])],
        'reminders': {
            'useDefault': False,
            'overrides': reminders if reminders else []
        },
    }
    return event
#Recurring event rule seperated by line for readability
#'RRULE:[FREQ=[DAILY/WEEKLY/Monthly]];
#       [Interval=[Int]];
#       [Count=[Int]];
#       [UNTIL=[End DateTime]]'
#There are more options but this is the basics

#TODO
#This has to be a specific task with the delimiter set to account for
#assumes we are getting a valid amount of hours
def createEventFromTask(task, h, startTime, timezone):
    taskNotesSplit = task['notes'].split("###",1)
    event = {
        'summary': task['title'],
        'location': None,
        'description': taskNotesSplit[1], #check this
        'start': {
            'dateTime': startTime,
            'timeZone': timezone,
        },
        'end': {
            'dateTime': datetime.isoformat(datetime.fromisoformat(startTime) + timedelta(hours = h)),
            'timeZone': timezone,
        },
        'recurrence': [],
        'attendees': [],
        'reminders': {
            'useDefault': False,
            'overrides': []
        },
    }
    #this next set of lines is to update the task to reflect the new amount of hours remaining
    #TODO, have to either write a task function or fix here
    hoursInt = int(taskNotesSplit[0].replace("###", ""))
    task['notes'] = "" + str(hoursInt - h) + "###" + taskNotesSplit[1]

    return event
