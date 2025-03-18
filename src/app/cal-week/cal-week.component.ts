import { Component } from '@angular/core';
import { Day } from '../day';

@Component({
  selector: 'app-cal-week',
  templateUrl: './cal-week.component.html',
  styleUrls: ['./cal-week.component.css']
})
export class CalWeekComponent {
  public date = new Date();
  public today = this.date.getDate();
  public today2 = this.date.getDay()
  public year = this.date.getFullYear();
  public monthName = "";
  public month = this.date.getMonth();
  day: Day | undefined;
  public months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];


ngOnInit() {
  this.setRows();
  this.monthName = `${this.months[this.month]} ${this.year}`;
}

  setRows() {
    let week: Day[] = new Array(7).fill({day: null, active: false});

    const tbody = document.querySelector("table tbody");
    if (tbody) {
        const times = ["12 AM", "1 AM", "2 AM ", "3 AM" , "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

                times.forEach(time => {
                  let row = document.createElement("tr"); 
                    const timeCell = document.createElement("td");  
                    timeCell.textContent = time;  
                    row.appendChild(timeCell);  

                    
                for (let i = 0; i < 7; i++) {
                    const cell = document.createElement("td");
                    // cell.addEventListener("click", () => this.insert());
                    row.appendChild(cell);  
                }

                tbody.appendChild(row);
            });
          } else {
            console.error("Sorry, Please try again!");
          }
          
  }

  insert() {
    const activecells = document.querySelectorAll("td");
    activecells.forEach(cell => {
        cell.addEventListener("click", (event) => {
            const clickedCell = event.target as HTMLElement; // having to to explicity determine the type
            if (clickedCell){
            clickedCell.classList.toggle("active"); 
            } else {
              console.error("can't do that, sorry.")
            }
        });
    });
}



}
