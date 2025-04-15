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
    #days will be indexed from 0 to last day of the month -1
    #returns a boolean based in whether or not the event was successfully added
    def addEvent(self, day, event):
        #if event is a task, it goes into the tasks list
        if(event.isTask()):
            if(self.__days[1][day] is None):
                self.__days[1][day] = [event]
            else:
                self.__days[1][day].append(event)
            return True

        #The List for the day at index "day"
        if (self.__days[0][day] is None):
            self.__days[0][day] = [event]
            return True
        #events are entered in chronolgical order
        for i in range(0, len(self.__days[0][day])):
            if not(event.isAfter(self.__days[0][day][i])):
                if event.overlaps(self.__days[0][day][i]):
                    #Implementing overlap will change
                    print(f"There is a scheduling conflict with {self.__days[0][day][i].getName()}.")
                    return False
                else:
                    self.__days[0][day].insert(i, event)
                return True
        self.__days[0][day].append(event)
        return True

    #Remove an event from a specific day in the schedule
    #this implementation looks for the object
    #assumes: list is not empty at "day", event occurs that day.
    #isTask is an int either 0 (event) or 1 (task)
    def removeEvent(self, day, event, isTask):
        self.__days[isTask][day].remove(event)

    #overall wrapper functions, functions will change as Implementation gets more complex
    def generateDaySchedule(self, day):
        #start of day will be the start of the day (wake up + get ready for the day)
        #Time tuple
        #add an event to block out the time at the begining of the day (to be removed at end)
        #Note: This may be temporary if sleep is going to be bblocked out
        startOfDayEvent = Event("Start Of Day Buffer", "", (0, 0), self.__generateStartOfDay())
        self.addEvent(day,startOfDayEvent)

        #same thing for end of Day
        endOfDayEvent = Event("End Of Day Buffer", "", self.__generateEndOfDay(), (23,59))
        self.addEvent(day,endOfDayEvent)
        #TODO: hard coded just to make sure this works, add complexity and usefulness
        while (bool(self.__days[1][day])):
            #task as an event with start time a negative number same maginitude as duration
            task = self.__days[1][day].pop()
            task.taskToEvent(self.__getDuration())
            #greedy implementation
            if(not (self.__fitEventGreedy(day, task))):
                #if __fitEventGreedy returns false, it wasn't able to find an open slot for every event
                return False
        return True
    
    
    #TODO: hard coded implementation for 8 am and 10 pm, will optimize
    def __generateStartOfDay(self):
        return (8,0)
    def __generateEndOfDay(self):
        return (22,0)
    
    #TODO: hard coded implementation for 30 minutes, will optimize
    def __getDuration(self):
        return 30

    #This fits a given Event into the first available slot in the schedule
    #This is the first and simplest implementation of this type of function
    def __fitEventGreedy(self, day, event):
        #If there are no events, add event no problems (might be obselete with current implementation of generateDaySchedule)
        if self.__days[0][day] is None:
            self.__days[0][day] = [event]
            return True
        #with current implemntation, the last event is the EOD buffer, so we cannot add an event after that
        for i in range(len(self.__days[0][day]) - 1):
            #offset will be = to the end of each event in the list
            #TODO I have to fix the implementation of offset and offsetTimes() to create correct time
            #TODO offset has to be a tuple
            #offset = self.__days[0][day][i].getEndTime() + (-1 * event.getStartTime())
            offset = self.__days[0][day][i].getEndTime()
            #offset is a tuple
            event.offSetTimes(offset)
            if (self.addEvent(day, event)):
                #if addEvent was succesful with no conflicts, it will return True
                return True
                #other wise, we keep going until EOD buffer
            #reset start/end times to base form:
            event.offSetTimes((offset[0] * -1, offset[1] * -1))
        return False
    #functions I want to implement:
    #The scoreSchedule function will encompase the entirety of the "B Features"
    #def scoreSchedule() = attatch a "score" to a day