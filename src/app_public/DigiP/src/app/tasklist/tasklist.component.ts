import { Component } from '@angular/core';
import { schedPayload } from '../models/creds.model';
import { Task, TaskBDTuple } from '../models/tasks.model';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent {
  todo: Task[] =[];
  pickedTasks: Task[] = [];
  bdNumbers: {[key: string]: number} = {};
  additionalNotes = '';
  endTime = '';
  savedEndTime = '';
  totalTasks : Task[] = [];

  constructor(private calendarService: GoogleCalendarService, private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.refresh();
  }

  /**
   * refresharray of tasks
   */
  refresh() {
    this.calendarService.getTaskfromLists('primary').subscribe((tasks: Task[]) => {
      this.todo = tasks.filter(task => task.status === 'needsAction');
    });
  }

  /**
   * select task for generated schedule breakdown
   * @param event 
   */
  selectTask (event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIds = Array.from(selectElement.selectedOptions).map(option => option.value);
  
    this.pickedTasks = this.todo.filter(task => selectedIds.includes(task.id));
    
    // Rebuild bdNumbers for picked tasks
    this.bdNumbers = {};
    this.pickedTasks.forEach(task => {
      if (!this.bdNumbers[task.id]) {
        this.bdNumbers[task.id] = 0;
      }
    });
  }

  addTask(taskId: string) {
    const selectedTask = this.todo.find(task => task.id === taskId);
    if (selectedTask && !this.pickedTasks.find(t => t.id === taskId)) {
      this.pickedTasks.push(selectedTask);
      this.totalTasks.push(selectedTask);
      this.bdNumbers[taskId] = 0; 
    }
  }

  removeTask(taskId: string) {
    this.pickedTasks = this.pickedTasks.filter(task => task.id !== taskId);
    delete this.bdNumbers[taskId];
  }

  /**
   * collects google creds and task requirements needed to send over to python backend
   */
  generate() {
    const taskBDTupleList: TaskBDTuple [] = this.pickedTasks.map(task => {
      return [
        {  id: task.id,
          title: task.title,
          notes: task.notes ?? '',
          due: task.due,
          status: task.status,
          completed: task.completed,
          updated: task.updated,
          selfLink: task.selfLink,
          parent: task.parent,
          position: task.position
        },
        this.bdNumbers[task.id]
      ]
    });
    
    console.log('Data to be sent to backend:', {
      pickedTasks: this.pickedTasks,
      bdNumbers: this.bdNumbers,
      taskBDTupleList,
      additionalNotes: this.additionalNotes
    });

    this.scheduleService.getCredentials().subscribe(creds => {
      const payload: schedPayload = {
         creds,
         taskBDTupleList,
        additionalNotes: this.additionalNotes,
        endTime: new Date(this.endTime).toISOString(),
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
    });

    this.refresh();
  }
  
  /**
   * resets generated schedule; clears out tasks
   */
  reset() {
    this.scheduleService.getCredentials().subscribe(creds => {
      let endTimeISO: string;
      //checks to make sure there was a deadline for those generated tasks so they can be deleted
      if (this.savedEndTime) {
        const parsedDate = new Date(this.savedEndTime);
        if (!isNaN(parsedDate.getTime())) {
          endTimeISO = parsedDate.toISOString();
        } else {
          console.warn('Invalid savedEndTime, using now instead');
          endTimeISO = new Date().toISOString();
        }
      } else {
        console.warn('No savedEndTime, using now instead');
        endTimeISO = new Date().toISOString();
      }
      // send the credentials and endTime back to backend
      const payload: any = {
        creds,
        endTime: endTimeISO,
      };
  
      console.log("payload", payload);
  
      this.scheduleService.resetSchedule(payload).subscribe({
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
    });
    
    this.refresh();
  }
  
}
