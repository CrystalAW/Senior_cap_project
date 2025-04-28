import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { GoogleCalendarService } from '../google-calendar.service';
import { schedPayload } from '../models/creds.model';
import { Task, TaskBDTuple } from '../models/tasks.model';
import { ScheduleService } from '../schedule.service';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent {
  todo: Task[] =[];
  progress: Task[] = [];
  complete: Task[] = [];

  constructor(private calendarService: GoogleCalendarService, private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.calendarService.getTaskfromLists('primary').subscribe((tasks: Task[]) => {
      this.todo = tasks.filter(task => task.status === 'needsAction' && !task.notes?.includes('[progress]') && !task.notes?.includes('[complete]'));
      this.progress = tasks.filter(task => task.notes?.includes('[progress]'));
      this.complete = tasks.filter(task => task.status === 'completed' || task.notes?.includes('[complete]'));
    });
  }

  // this code is from https://material.angular.io/cdk/drag-drop/overview
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, 
        event.previousIndex, event.currentIndex);
    } 
  }

  trackItem(index: number, item: any): any {
    return item.id || item;
  }


  generate() {
    const taskBDTupleList: TaskBDTuple[] = this.todo.map(task => {
      return [
        {
          id: task.id,
        },
        6 as number
      ] as TaskBDTuple;
    });
    this.scheduleService.getCredentials().subscribe(creds => {
      const payload: schedPayload = {
         creds,
         taskBDTupleList,
        additionalNotes: 'I want to spread these hours out',
        endTime: new Date().toISOString(),
        tz: 'America/New_York'
      };

      this.scheduleService.generateSchedule(payload).subscribe({
        next: (res) => {
          console.log('Schedule created:', res);
        },
        error: (err) => {
          console.error('Schedule creation error:', err);
        },
        complete: () => {
          console.log('Request complete');
        }
      });
    })
  }
  
  //cal createtask to add that feature
}
