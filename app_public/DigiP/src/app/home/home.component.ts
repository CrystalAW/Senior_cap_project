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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token'] && params['user']) {
        const user = JSON.parse(params['user']);
        const token = params['token'];
        
        // Now store the user and token in the AuthService
        this.authService.setUser(user, token);
        
        // Navigate to the home page or wherever you want
        this.router.navigate(['/']);
      }
    });
  }

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
