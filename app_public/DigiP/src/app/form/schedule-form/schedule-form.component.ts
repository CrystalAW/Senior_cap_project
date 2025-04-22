import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScheduleComponent } from 'src/app/schedule/schedule.component';
import { TasklistComponent } from 'src/app/tasklist/tasklist.component';

@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css']
})
export class ScheduleFormComponent {
  scheduleForm!: FormGroup;
  @Output() submitForm = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private schedule: ScheduleComponent, private tasks: TasklistComponent) {}

  events: ScheduleComponent[] = [];
  tasklist: TasklistComponent[] = [];

  ngOnInit(): void {
  
    this.scheduleForm = this.fb.group({
      entries: this.fb.array([this.createEntry()])
    });
  }

  get entries(): FormArray {
    return this.scheduleForm.get('entries') as FormArray;
  }
 //pull events and tasks from each component and then assign each task a value and then attach the b
 //breakdown question to it.

//  listEntries() {

// }
 
  createEntry(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      due: [''],
      start: [''],
      end: [''],
      notes: [''],
      hours: []
    });
  }

  addEntry(): void {
    this.entries.push(this.createEntry());
  }

  removeEntry(index: number): void {
    this.entries.removeAt(index);
  }

  onSubmit(): void {
    const formData = this.scheduleForm.value.entries;
    const tasks = formData.map((entry: any) => ({
      title: entry.title,
      notes: entry.notes,
      due: entry.due ? new Date(entry.due).toISOString() : undefined,
      status: 'needsAction'
    }));

    const events = formData.map((entry: any) => ({
      summary: entry.title,
      description: entry.description,
      start: {
        dateTime: entry.start ? new Date(entry.start).toISOString() : null,
        timeZone: 'UTC'
      },
      end: {
        dateTime: entry.end ? new Date(entry.end).toISOString() : null,
        timeZone: 'UTC'
      }
    }));

    console.log('Submitting all:', { tasks, events });

    this.submitForm.emit(formData);
  }
}
