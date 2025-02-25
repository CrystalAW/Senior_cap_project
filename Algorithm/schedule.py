#Schedule will be the schedule for a month (to start)

#extra note: 2006, 2012, 2017, 2023 has Jan 1st on a Sunday (figure out algorithm for line up later)
#Also to do later: events that carry over days?

from event import *
import collections

#this schedule will at its largest; represents one month within one object
class Schedule:
    #month as int
    __month = None 
    __year = None
    #days is in the form of a tuple where:
    #[0] is ths list of events
    #[1] is the list of tasks
    __days = None
    
    def __init__(self, month, year):
        self.__month = month
        self.__year = year
        if (month == 2):
            if ((year % 4 == 0)):
                self.__days = ([None] * 29, [None] * 29)
            self.__days = ([None] * 28, [None] * 28)
        elif (month == 4 or month == 6 or month == 9 or month == 11):
            self.__days = ([None] * 30, [None] * 30)
        else:
            self.__days = ([None] * 31, [None] * 31)

    #accessors
    def getMonth(self):
        return self.__month
    
    def getYear(self):
        return self.__year
    
    def getDays(self):
        return self.__days

    #add an event to a specific day of the month
    #days will be indexed from 0 to last day of the month-1
    def addEvent(self, day, event):
        #if event is a task, it goes into the tasks list
        if(event.isTask()):
            if(self.__days[1][day] is None):
                self.__days[1][day] = [event]
            else:
                self.__days[1][day].append(event)
            return

        #The List for the day at index "day"
        if (self.__days[0][day] is None):
            self.__days[0][day] = [event]
            return
        #events are entered in chronolgical order
        for i in range(0, len(self.__days[0][day])):
            if not(event.isAfter(self.__days[0][day][i])):
                if event.overlaps(self.__days[0][day][i]):
                    #Implementing overlap will change
                    print(f"There is a scheduling conflict with {self.__days[0][day][i].getName()}.")
                else:
                    self.__days[0][day].insert(i, event)
                return
        self.__days[0][day].append(event)

    #Remove an event from a specific day in the schedule
    #this implementation looks for the object
    #assumes: list is not empty at "day", event occurs that day.
    #isTask is an int either 0 (event) or 1 (task)
    def removeEvent(self, day, event, isTask):
        self.__days[isTask][day].remove(event)