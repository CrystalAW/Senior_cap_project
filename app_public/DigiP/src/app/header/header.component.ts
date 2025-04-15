import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
   /* this function changes the display value of the profile/account */ 
   settings = document.getElementById("settings");
   hidden = false;
 showSettings() {
  if (this.settings) {
    this.settings.hidden = !this.hidden;
  }
}
}
