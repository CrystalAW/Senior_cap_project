import { Component } from '@angular/core';

@Component({
  selector: 'app-cal-day',
  templateUrl: './cal-day.component.html',
  styleUrls: ['./cal-day.component.css']
})
export class CalDayComponent {

  ngOnInit() {
    this.setRows();
    // this.monthName = `${this.months[this.month]} ${this.year}`;
  }
  setRows() {
    const tbody = document.querySelector("table tbody");
    if (tbody) {
        const times = ["12 AM", "1 AM", "2 AM ", "3 AM" , "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

                times.forEach(time => {
                  let row = document.createElement("tr"); 
                    const timeCell = document.createElement("td");  
                    timeCell.textContent = time;  
                    row.appendChild(timeCell);  

        
                    const cell = document.createElement("td");
                    // cell.addEventListener("click", () => this.insert());
                    row.appendChild(cell);  

                tbody.appendChild(row);
            });
          } else {
            console.error("Sorry, Please try again!");
          }
          
  }

}
