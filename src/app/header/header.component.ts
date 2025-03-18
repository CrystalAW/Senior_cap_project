import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
   /* this function changes the display value of the profile/account */ 
   showSettings() {
    const settings = document.getElementById("settings");
    const hidden = settings?.hidden;
    if (settings) {
      settings.hidden = !hidden;
    }
  }
}
