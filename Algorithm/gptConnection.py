import openai
from eventFunction import *
from taskFunction import *
from dotenv import load_dotenv
import os

load_dotenv()
openai_key = os.getenv("GPT_API_KEY")
client = openai.OpenAI(api_key=openai_key)

def gptPrompt(text: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4",  # or "gpt-4-1106-preview" or "gpt-4o" depending on your access
        messages=[
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content

#functions to build my input from what I have already
#This is the base function for everything I will do with prompts
def buildPrompt(eventStr, taskBDStr, additionalNotes, currentTime):
    prompt = "Build a schedule using ONLY the following inputs:\n"
    prompt += eventStr
    prompt += "Important: You must NOT re-schedule any of the following preexisting events. They are already scheduled and must be treated as immovable fixed events, do not include them in the output.\n"
    prompt += "\nAnd the following tasks with the amount of time associated with them:\n"
    prompt += taskBDStr
    prompt += "\nand these (if listed), additional requirements:\n"
    prompt += additionalNotes
    prompt += "\nThe current time is:"
    prompt += currentTime
    prompt += ". Do not schedule anything before the current time.\n"
    prompt += "Distribute the tasks as evenly and efficiently as possible throughout the available free time.\n"

    # Strict non-overlapping scheduling rules
    prompt += "The new events created from tasks must NEVER overlap with any preexisting events or other newly created task blocks.\n"
    prompt += "After scheduling each new task block, immediately update the list of occupied times with the new event.\n"
    prompt += "Always use the updated list to find the next available free time slots.\n"
    prompt += "Each new task block must:\n"
    prompt += "- Start after the end of the previous event.\n"
    prompt += "- End before the start of the next event.\n"
    prompt += "Even a 1-minute overlap is forbidden.\n"

    # Gaps and partial time handling
    prompt += "Before scheduling any block, check the size of the free gap.\n"
    prompt += "If the gap is smaller than the intended task block duration, shorten the block to fit exactly into the available gap.\n"
    prompt += "Never create a block with zero or negative duration.\n"
    prompt += "If no sufficient gap exists for even a 0.25-hour (15 minutes) block, skip that gap.\n"

    prompt += "When scheduling a task block:\n"
    prompt += "   - You must first identify the available free time between the end of the previous event and the start of the next event.\n"
    prompt += "   - The scheduled task block must fit fully inside this gap.\n"
    prompt += "   - The end time of the task block must ALWAYS be earlier than or equal to the start time of the next event.\n"
    prompt += "   - If the original task duration is too large to fit, shorten the task block duration to fit exactly into the available gap.\n"
    prompt += "   - You must NEVER allow a task block's end time to extend past the start time of the next scheduled event.\n"
    prompt += "   - Ensure every block respects the boundary set by the next event.\n"

    # Task splitting and full consumption rules
    prompt += "You are allowed and encouraged to split a task's allocated hours into multiple blocks of different lengths (e.g., 0.5h, 1.25h, 0.25h, etc.).\n"
    prompt += "For every task:\n"
    prompt += "- Schedule events that together add up exactly to the task's assigned total hours.\n"
    prompt += "- If larger blocks don't fit, break into smaller blocks until all time is scheduled.\n"
    prompt += "- Only leave task hours unscheduled if no available time remains before the task's due date.\n"

    # Merging adjacent task blocks
    prompt += "After scheduling:\n"
    prompt += "- If two or more consecutive blocks belong to the same task, and one starts immediately after the previous one ends, merge them into a single event.\n"
    prompt += "- The merged block must:\n"
    prompt += "    - Use the start time of the first block.\n"
    prompt += "    - Have a duration equal to the total of the merged blocks.\n"
    prompt += "- Only merge blocks for the same task, and only if there is no time gap between them.\n"
    prompt += "- Always prefer fewer, longer blocks when possible without violating any rules.\n"

    # Output formatting rules
    prompt += "The ONLY output should follow this exact format — no explanations, no extra text, no bullet points:\n"
    prompt += "[Task Name (no ##BD##)],[duration in hours as an int or float],[ISO8601 startTime with timezone],,\n"
    prompt += "Each output line MUST end with a **double comma**, exactly like `,,`, not a single comma.\n"
    prompt += "Do NOT place quotation marks (\" or ') around the start time. The start time must appear exactly as a plain ISO8601 string."
    prompt += "Do NOT include any extra words, quotation marks, labels, bullet points, or comments.\n"
    prompt += "The entire output must ONLY consist of valid lines following that exact structure.\n"
    prompt += "If you include anything outside the specified format, it will break the program. Respond strictly as instructed.\n"

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
    print(output)
    print()
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
