import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { CalDayComponent } from './cal-day/cal-day.component';
import { CalWeekComponent } from './cal-week/cal-week.component';
import { CalendarComponent } from './calendar/calendar.component';
import { HomeComponent } from './home/home.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { TasklistComponent } from './tasklist/tasklist.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'monthly', component: CalendarComponent},
  {path: 'weekly', component: CalWeekComponent},
  {path: 'daily', component: CalDayComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    HomeComponent,
    ScheduleComponent,
    TasklistComponent,
    CalWeekComponent,
    CalDayComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
     NgbModule,
     RouterModule.forRoot(routes),
     BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
