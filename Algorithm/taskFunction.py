#Functions relating to tasks'
from eventFunction import *
import datetime

def createTask(title, notes=None, due_date=None):
    task = {
        'title': title,
    }

    if notes:
        task['notes'] = notes
    if due_date:
        task['due'] = due_date
    
    return task

def delete_task(service, task_id):
    try:
        service.tasks().delete(tasklist='@default', task=task_id).execute()
    except Exception as e:
        print("Error deleting task:", e)

#Creates a new Task with hours assigned to it to be used to break down hours
def createTaskBreakdown(task, hours):
    newTask = {
        'title' : "##BD##" + task['title'],
        'notes' : (str(hours) + "###" + task['notes']),
        'due' : task['due']
    }
    return newTask
    

def getTasks(service, due_by_date):
    """
    Fetches tasks due on or before the specified date.
    :param service: The authenticated Google Tasks service.
    :param tasklist_id: The ID of the task list to search.
    :param due_by_date: A string in 'YYYY-MM-DD' format.
    :return: List of matching tasks.
    """
    due_by = datetime.datetime.fromisoformat(due_by_date).date()

    all_tasks = service.tasks().list(tasklist='@default', showCompleted=False).execute()
    tasks = all_tasks.get('items', [])
    
    filtered_tasks = []
    for task in tasks:
        due_str = task.get('due')
        if due_str:
            if due_str.endswith("Z"):
                due_str = due_str.replace("Z", "+00:00")

            task_due = datetime.datetime.fromisoformat(due_str).date()

            if task_due <= due_by:
                filtered_tasks.append(task)

    return filtered_tasks