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
    __days = None
    
    def __init__(self, month, year):
        self.__month = month
        self.__year = year
        if (month == 2):
            if ((year % 4 == 0)):
                self.__days = [None] * 29
            self.__days = [None] * 28
        elif (month == 4 or month == 6 or month == 9 or month == 11):
            self.__days = [None] * 30
        else:
            self.__days = [None] * 31

    #accessors
    def getMonth(self):
        return self.__month
    
    def getYear(self):
        return self.__year
    
    def getDays(self):
        return self.__days
    
    #TODO: Add tests
    #add an event to a specific day of the month
    # days will be indexed from 0 to last day of the month-1
    def addEvent(self, day, event):
        #The List for the day at index "day"
        dayList = self.__days[day]
        if (dayList is None):
            dayList = [event]
            return
        #events are entered in chronolgical order
        for i in range(0, len(dayList) - 1):
            if ~(event.isAfter(dayList[i])):
                if event.overlaps(dayList[i]):
                    #Implementing overlap will change
                    print(f"There is a scheduling conflict with {dayList[i].getName()}.")
                else:
                    dayList.insert(i, event)
                return