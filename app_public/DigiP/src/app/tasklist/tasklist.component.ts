import { Component } from '@angular/core';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css']
})
export class TasklistComponent {
  tasks = [
    { name: 'Task 1', dueDate: new Date(), progress: 50, selected: false },
    { name: 'Task 2', dueDate: new Date(), progress: 20, selected: false },
    { name: 'Task 3', dueDate: new Date(), progress: 80, selected: false },
    // Add more tasks here...
  ];

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.tasks.forEach(task => task.selected = isChecked);
  }
}
