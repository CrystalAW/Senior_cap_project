import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DigiP';

  constructor(private authService: AuthService, public router: Router) {}

  ngOnInit(): void {
    //Check if the user is logged in when the app loads (from localStorage or backend)
    this.authService.checkLoggedInUser();
    console.log( "Well:", this.authService.checkLoggedInUser());
  }

  hide():boolean {
    const hidden = ['/login'];
    return hidden.includes(this.router.url);
  }
}
