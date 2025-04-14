#Functions relating to Events
import datetime
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
            'dateTime': datetime.datetime.isoformat(datetime.datetime.fromisoformat(startTime) + datetime.timedelta(hours = h)),
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

#get events in a given frame, if start is left blank, will start from current time
#Using UTC format as iso
def getEvents(servicePath, end, start = None):
    startTime = start if start else datetime.datetime.now(tz=datetime.timezone.utc).isoformat()
    events_result = (
        servicePath.events().list(
            calendarId="primary",
            timeMin=startTime,
            timeMax = end,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    events = events_result.get("items", [])
    #can get rid of the console output when I am done testing.
    if not events:
      print("No upcoming events found.")
      return
    else:
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            print(f"{event['summary']} — {start}")

    return events

#start of day is a timeDelta
def taskBDGreedy(servicePath, taskBD, minTime, startOfDay, tz):
    #create a start of day event 
    #starting the next day
    tomorrow = datetime.datetime.now(tz) + datetime.timedelta(days=1)
    midnight = datetime.datetime.combine(tomorrow.date(), datetime.time.min, tzinfo = tz)
    sod = midnight + startOfDay
    Rrule = "RRULE:FREQ=DAILY;UNTIL=" + taskBD['due']
    startOfDayEvent = createEvent("Placeholder", "null", "null", midnight, sod, tz, Rrule)
    startOfDayEvent = servicePath.events().insert(calendarId='primary', body=startOfDayEvent).execute()
    events = getEvents(servicePath, taskBD['due'])
    print(minTime) #only so it can be anything, delete after check



    #Deleting any events that were only added to space this out.
    servicePath.events().delete(calendarId= '@default', eventId=startOfDayEvent['id']).execute()
    return