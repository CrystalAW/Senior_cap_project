from event import Event
from schedule import Schedule

def test_event():
    print("\n==== Testing Event Class ====")
    
    # Create events and tasks
    e1 = Event("Meeting", "Project discussion", (9, 0), (10, 0))
    e2 = Event("Standup", "Daily sync", (9, 30), (10, 30))
    e3 = Event("Lunch", "Break", (12, 0), (13, 0))
    t1 = Event("Submit Report")  # Task with no start time

    # Print events and test overlap/isAfter
    for e in [e1, e2, e3, t1]:
        print(e)

    print(f"Overlap (Meeting & Standup): {e1.overlaps(e2)}")  # True
    print(f"Overlap (Meeting & Lunch): {e1.overlaps(e3)}")    # False
    print(f"Is After (Standup after Meeting): {e2.isAfter(e1)}")  # True
    print(f"Is After (Meeting after Lunch): {e1.isAfter(e3)}")    # False
    print(f"Is '{t1.getName()}' a task? {t1.isTask()}")           # True

def test_schedule():
    print("\n==== Testing Schedule Class ====")

    schedule = Schedule(3, 2023)
    print(f"Created Schedule for {schedule.getMonth()}/{schedule.getYear()}")

    # Create events and tasks
    e1 = Event("Workshop", "Training", (10, 0), (11, 30))
    e2 = Event("Lunch", "Break", (12, 0), (13, 0))
    t1 = Event("Submit Report")  # Task with no time

    # Add events and tasks to March 2nd (index 1)
    schedule.addEvent(1, e1)
    schedule.addEvent(1, e2)
    schedule.addEvent(1, t1)

    # Print schedule for March 2nd
    day_events, day_tasks = schedule.getDays()[0][1], schedule.getDays()[1][1]
    
    print("\nEvents on March 2nd:")
    if day_events:
        for event in day_events:
            print(event)
    
    print("\nTasks on March 2nd:")
    if day_tasks:
        for task in day_tasks:
            print(task)

    # Test scheduling conflict
    e_conflict = Event("Overlapping Meeting", "Conflict test", (10, 30), (11, 30))
    print("\nAdding conflicting event...")
    schedule.addEvent(1, e_conflict)  # Should trigger a scheduling conflict

def test_remove_event():
    print("\n==== Testing Remove Event Function ====")

    schedule = Schedule(5, 2023)
    e1 = Event("Workshop", "Training", (10, 0), (12, 0))
    e2 = Event("Lunch", "Break", (12, 30), (13, 30))
    
    # Add to May 10th (index 9)
    schedule.addEvent(9, e1)
    schedule.addEvent(9, e2)

    print("\nEvents on May 10th before removal:")
    for event in schedule.getDays()[0][9] or []:
        print(event)

    # Remove event
    print("\nRemoving 'Lunch' event...")
    schedule.removeEvent(9, e2, 0)

    print("\nEvents on May 10th after removal:")
    for event in schedule.getDays()[0][9] or []:
        print(event)

    # Attempt to remove a non-existent event
    try:
        print("\nTrying to remove an event that isn't scheduled...")
        schedule.removeEvent(9, Event("Nonexistent", "Fake event", (14, 0), (15, 0)), 0)
    except ValueError:
        print("Error: Attempted to remove an event that does not exist.")

def main():
    test_event()
    test_schedule()
    test_remove_event()

if __name__ == "__main__":
    main()
