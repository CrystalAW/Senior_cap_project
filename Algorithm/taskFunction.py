#Functions relating to tasks'
from eventFunction import *

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
    

