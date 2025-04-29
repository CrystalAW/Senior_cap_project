from openai import OpenAI
from eventFunction import *
from taskFunction import *
from dotenv import load_dotenv
import os

load_dotenv()
openai_key = os.getenv("GPT_API_KEY")
client = OpenAI(api_key = openai_key)

#takes a string input and queries using chat gpt
def gptPrompt(text):
    response = client.responses.create(
        model="gpt-4.1",
        input= text
    )
    return (response.output_text)

#functions to build my input from what I have already
#This is the base function for everything I will do with prompts
def buildPrompt(eventStr, taskBDStr, additionalNotes, currentTime):
    prompt = "Can you build a schedule based off of the following events:\n"
    prompt += eventStr
    prompt += "\nAnd the following tasks with the amount of time associated with them:\n"
    prompt += taskBDStr
    prompt += "\nand these (if listed), additional requirements:\n"
    prompt += additionalNotes
    prompt += "\nWith no events from tasks starting before the current time of:"
    prompt += currentTime
    prompt += "\nwith the tasks distributed through out the day without overlapping any preexisting or newly created events, making sure that all events are done before the task's due date and time. "
    prompt += "in this format for only the new events created for the tasks:\n"
    prompt += "[Task Name (dirrect from the string)],[duration of task block as an int],[startTime of specific task block in proper time zone definition for google calendar],,"
    prompt += "\nAnd only output that part on the same line"
    return prompt

#takes an object of type List[Dict] and makes it into a string to be used by the prompt
def listEventsAsString(events):
    if not events:
        return "No events found."

    lines = []
    for event in events:
        summary = event.get("summary", "No Title")
        start = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date")
        end = event.get("end", {}).get("dateTime") or event.get("end", {}).get("date")
        lines.append(f"{summary} | Start: {start} | End: {end}")
    
    return "\n".join(lines)

#This is the base function, will need to be retooled to parse out my hours blocked
def listTasksAsString(tasks):
    lines = []
    for task in tasks:
        notes = task.get('notes', 'No Description').strip()
        due = task.get('due', 'No due date')
        lines.append(f"{task['title']}, Description:{notes} — Due: {due}")
        #print(f"{task['title']}, Description:{notes} — Due: {due}")
    return lines
#This modification to the origional listing function is now parsing notes to see if there
#is a distinction for a task to be broken down
def listTasksAsStringBD(tasks):
    lines = []
    for task in tasks:
        notes = task.get('notes', 'No Description').strip()
        if ("###" in notes):
            taskNotesSplit = task['notes'].split("###",1)
            hoursStr = taskNotesSplit[0].replace("###", "")

            due = task.get('due', 'No due date')
            lines.append(f"{task['title']}, Time Allocated: {hoursStr} Description:{taskNotesSplit[1]} — Due: {due}.")
            #print(f"{task['title']}, Time Allocated: {hoursStr} Description:{taskNotesSplit[1]} — Due: {due}")
    return "\n".join(lines)

def lexOutput(output, eventService, taskService, tasks, tz):
    #takes the output and breaks it into different lines
    entries = [entry.strip() for entry in output.split(",,") if entry.strip() and entry.strip().lower() != "\n"]
    currentTask = None
    for entry in entries:
        title, hours, start = entry.split(",")
        hoursF = float(hours)
        title = "##BD##" + title
        for task in tasks:
            if task.get('title') == title:
                currentTask = taskService.tasks().get(tasklist="@default", task=task['id']).execute() 
        createEventFromTask(eventService, taskService, currentTask, hoursF, start, tz)
        #find the corresponding task name:
