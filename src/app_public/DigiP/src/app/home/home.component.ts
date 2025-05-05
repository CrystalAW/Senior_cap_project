import { Component } from '@angular/core';
import { ActivatedRoute ,Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  visible = false;
  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute) {}

  user = this.authService.getUser();
  //routes for the other pages

  goToCalendar() {
    this.router.navigate(['/calendar']);
  }

  goToSchedule() {
    this.router.navigate(['/schedule']);
  }

  goToTasks() {
    this.router.navigate(['/tasks']);
  }

}
