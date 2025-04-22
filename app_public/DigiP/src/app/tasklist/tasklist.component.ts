import { Component } from '@angular/core';
import { GoogleCalendarService } from '../google-calendar.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../tasks.model';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent {
  todo: Task[] =[];
  progress: Task[] = [];
  complete: Task[] = [];

  constructor(private calendarService: GoogleCalendarService) {}
  ngOnInit(): void {
    this.calendarService.getTaskfromLists('primary').subscribe((tasks: Task[]) => {
      // You can expand logic here based on additional flags if needed
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
}
