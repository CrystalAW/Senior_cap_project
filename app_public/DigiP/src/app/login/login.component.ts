import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
    log = false;
    sign = true

    constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        if (params['error'] === 'unauthorized') {
          alert ('Access Denied! This account is not authorized.')
        }

        const token = params['token'];
        const user = params['user'];

        if (token && user) {
          const parsedUser = JSON.parse(decodeURIComponent(user));
          this.authService.setUser(parsedUser, token);
          this.router.navigate(['/']);
        }
      });

      
    }

    login() {
      this.authService.googleLogin();
    }

}
