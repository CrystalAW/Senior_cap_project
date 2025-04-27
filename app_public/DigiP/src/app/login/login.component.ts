import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
    log = false;
    sign = true

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit() {
      this.authService.getUserListener().subscribe(
        (user) => {
          if (user != null) {
            this.router.navigate(['/']);
          }
        })
    }

    register(form: NgForm) {
      this.authService.register({
        user: {email: form.value.email, name:form.value.name},
        password: form.value.password
      });
    }

    changeView(selected: string) {
      if (selected === 'log') {
        this.log = !this.log;
        this.sign = !this.sign;
      } else if (selected === 'sign') {
        this.log = !this.log;
        this.sign = !this.sign;
      }
    }

}
