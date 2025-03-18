import { Component } from '@angular/core';
import { Day } from '../day';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent{
  
        public date = new Date();
        public year = this.date.getFullYear();
        public month = this.date.getMonth();
        public today = this.date.getDate();
        public dates: Day[][] = [];
        public monthName = "";
        day: Day | undefined;

        get Status() {
          let status = this.day?.active;
          return status;
        }

        public months = [
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
        ];

        ngOnInit() {
          this.generate();
        }

         generate() {
          let firstday = new Date(this.year, this.month, 1).getDay();
          let lastday = new Date(this.year, this.month + 1, 0).getDate();
          let ldayd = new Date(this.year, this.month, lastday).getDay();
          let prevlstday = new Date(this.year, this.month, 0).getDate();
          this.dates = [];

          let week: Day[] = new Array(7).fill({day: null, active: false});
          let rowCount = 0;

          //previous month
          for(let i = firstday -1; i >= 0; i--) {
            week[i] = { day: prevlstday--, active: false};
          }

          //current month
          for (let i = 1; i <= lastday; i++) {
            const dayIndex = (firstday + i - 1) % 7;
            week[dayIndex] = {day: i, active: true};

            if (dayIndex === 6) {
              this.dates.push(week);
              rowCount++;
              week = new Array(7).fill({day: null, active: false});
            }
          }

          if (week.some(day => day.day != null)) {
            this.dates.push(week);
            rowCount++;
            console.log("current:", rowCount);
          }

          //next month
          if (rowCount < 6) {
          let nextMonth = 1;
          for (let i = week.findIndex(day => day.day === null); i < 7; i++) {
            week[i] = {day: nextMonth++, active:false};
          }


          if (week.some(day => day.day != null)) {
            this.dates.push(week);
            console.log("next:", week);
          }
        }

        // if (rowCount === 7) {
        //   this.dates.pop();
        // }
          console.log(this.dates);
          this.monthName = `${this.months[this.month]} ${this.year}`;
        };
      
          prev() {
          this.month = this.month - 1;
          this.generate();
          }

          next() {
            this.month = this.month + 1;
          this.generate();
          }

}
