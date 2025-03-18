#A task is an event with NULL values for start and end time

class Event:
    __name = None
    __description = None
    #times represented by a tuple of ints (hour, minute)
    __startTime = None
    __endTime = None

    #init for a task
    def __init__(self, name, description = None, startTime = None, endTime = None):
        self.__name = name
        self.__description = description
        self.__startTime = startTime
        self.__endTime = endTime
    
    #accessor functions
    def getName(self):
        return self.__name
    
    def getDescription(self):
        return self.__description
    
    def getStartTime(self):
        return self.__startTime

    def getEndTime(self):
        return self.__endTime
    
    #mutator functions
    def setName(self, name):
        self.__name = name

    def setDescription(self, description):
        self.__description = description

    def setStartTime(self, startTime):
        self.__startTime = startTime

    def setEndTime(self, endTime):
        self.__endTime = endTime   

    #other functions:
    #A task is an event that dose not have a start time
    def isTask(self):
        return self.__startTime is None
    
    #comparisons
    @staticmethod
    def time_to_minutes(time_tuple):
        return time_tuple[0] * 60 + time_tuple[1]
    
    #abs only for task to event
    @staticmethod
    def minutes_to_time(minutes):
        return (int(minutes/60), abs(minutes) % 60)
        

    #is the parameter "event" begining after this one ends
    def isAfter(self, event):
        startSelf = Event.time_to_minutes(self.__startTime)
        endEvent = Event.time_to_minutes(event.getEndTime())
        return (startSelf > endEvent)
    
    def overlaps(self, event):
        #checking if self event is overlapping at the start and at the end
        startSelf = Event.time_to_minutes(self.__startTime)
        endSelf = Event.time_to_minutes(self.__endTime)
        startEvent = Event.time_to_minutes(event.getStartTime())
        endEvent = Event.time_to_minutes(event.getEndTime())

        # Two events overlap if the start of one is before the end of the other and vice versa.
        return startSelf < endEvent and startEvent < endSelf
    
    #untested:
    #create an event out of a task
    #estimated duration (in minutes) is subtracted from 0, end time is 0
    def taskToEvent(self, duration):
        self.__startTime = (0,0)
        self.__endTime = Event.minutes_to_time(duration)

    #offset is a tuple
    def offSetTimes(self, offset):
        ttmOffset = self.time_to_minutes(offset)
        self.__startTime = (self.__startTime[0] + int(ttmOffset / 60), self.__startTime[1] + (ttmOffset % 60)) 
        self.__endTime = (self.__endTime[0] + int(ttmOffset / 60), self.__endTime[1] + (ttmOffset % 60))

        
    #printString (this is already tested)
    def __str__(self):
        if self.__startTime and self.__endTime:
            return f"{self.__name} ({self.__startTime[0]}:{self.__startTime[1]:02d} - {self.__endTime[0]}:{self.__endTime[1]:02d})"
        else:
            return f"{self.__name} (No time specified)"