import unittest
from schedule import Schedule
from event import Event

class TestSchedule(unittest.TestCase):

    def setUp(self):
        """Set up a test schedule (March 2025)"""
        self.schedule = Schedule(3, 2025)

    def test_create_event(self):
        """Test event creation and attribute retrieval"""
        event = Event("Meeting", "Project discussion", (9, 0), (10, 0))
        self.assertEqual(event.getName(), "Meeting")
        self.assertEqual(event.getDescription(), "Project discussion")
        self.assertEqual(event.getStartTime(), (9, 0))
        self.assertEqual(event.getEndTime(), (10, 0))

    def test_is_task(self):
        """Test if a task is correctly identified"""
        task = Event("Do Homework")  # No start or end time
        self.assertTrue(task.isTask())

    def test_add_event(self):
        """Test adding an event to the schedule"""
        event = Event("Workout", "", (7, 30), (8, 30))
        result = self.schedule.addEvent(0, event)  # Add event to March 1st
        self.assertTrue(result)

    def test_add_task(self):
        """Test adding a task to the schedule"""
        task = Event("Read book")
        result = self.schedule.addEvent(0, task)
        self.assertTrue(result)

    def test_event_ordering(self):
        """Test that events are inserted in chronological order"""
        event1 = Event("Breakfast", "", (8, 0), (8, 30))
        event2 = Event("Meeting", "", (9, 0), (10, 0))
        event3 = Event("Workout", "", (7, 0), (7, 45))

        self.schedule.addEvent(0, event1)
        self.schedule.addEvent(0, event2)
        self.schedule.addEvent(0, event3)  # Should be placed at the start

        scheduled_events = self.schedule.getDays()[0][0]  # Events on March 1st
        self.assertEqual(scheduled_events[0].getName(), "Workout")
        self.assertEqual(scheduled_events[1].getName(), "Breakfast")
        self.assertEqual(scheduled_events[2].getName(), "Meeting")

    def test_event_overlap(self):
        """Test event overlap detection and rejection"""
        event1 = Event("Class", "", (10, 0), (11, 0))
        event2 = Event("Meeting", "", (10, 30), (11, 30))  # Overlaps with event1

        self.schedule.addEvent(0, event1)
        result = self.schedule.addEvent(0, event2)  # Should return False due to conflict

        self.assertFalse(result)

    def test_task_to_event(self):
        """Test converting a task into an event"""
        task = Event("Write report")
        task.taskToEvent(45)  # 45-minute estimated duration
        self.assertEqual(task.getStartTime(), (0,0))
        self.assertEqual(task.getEndTime(), (0, 45))

    def test_remove_event(self):
        """Test removing an event"""
        event = Event("Doctor's Appointment", "", (14, 0), (15, 0))
        self.schedule.addEvent(0, event)
        self.schedule.removeEvent(0, event, 0)  # 0 indicates it's an event (not a task)

        self.assertNotIn(event, self.schedule.getDays()[0][0])  # Should be removed

    def test_generate_day_schedule_with_existing_events(self):
        """Test scheduling tasks when some events already exist"""
        # Manually adding fixed events to March 1st
        meeting = Event("Team Meeting", "", (9, 0), (10, 0))
        lunch = Event("Lunch Break", "", (12, 0), (13, 0))
        study_session = Event("Study Session", "", (15, 0), (17, 0))

        self.schedule.addEvent(0, meeting)
        self.schedule.addEvent(0, lunch)
        self.schedule.addEvent(0, study_session)

        # Adding tasks (which need to be scheduled)
        task1 = Event("Write Report")  # Task without a set time
        task2 = Event("Read Book")  # Another task
        task3 = Event("Exercise")  # Another task

        self.schedule.addEvent(0, task1)  # Adding to March 1st
        self.schedule.addEvent(0, task2)
        self.schedule.addEvent(0, task3)

        # Generate the daily schedule
        result = self.schedule.generateDaySchedule(0)

        # Ensure scheduling was successful
        self.assertTrue(result)

        # Retrieve scheduled events (tasks should now have times)
        scheduled_events = self.schedule.getDays()[0][0]

        # Check if events and tasks are scheduled properly
        self.assertEqual(len(scheduled_events), 8)  # 3 existing events + 3 tasks + 2 buffer events

        # Ensure all scheduled tasks have valid times
        for event in scheduled_events:
            self.assertIsNotNone(event.getStartTime())  # All should have start times
            self.assertIsNotNone(event.getEndTime())

        # Print schedule for manual verification
        print("\nScheduled Events for March 1st:")
        for event in scheduled_events:
            print(event)

if __name__ == "__main__":
    unittest.main()
