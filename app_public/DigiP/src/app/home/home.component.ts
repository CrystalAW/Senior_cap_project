import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  visible = false;
  constructor(private router: Router) {}

  goToCalendar() {
    this.router.navigate(['/calendar']);
  }

  goToSchedule() {
    this.router.navigate(['/schedule']);
  }

  goToTasks() {
    this.router.navigate(['/tasks']);
  }

  toggleForm() {
    this.visible = !this.visible;
  }
  handleFormSubmit(data: any) {
    console.log('Form submitted:', data);
  }
}
