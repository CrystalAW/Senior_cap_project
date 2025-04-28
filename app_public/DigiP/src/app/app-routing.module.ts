import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { authGuard } from './services/auth.guard';
import { TasklistComponent } from './tasklist/tasklist.component';

const routes: Routes = [
  {path: "", component:HomeComponent, canActivate: [authGuard]},
  {path: "calendar", component:CalendarComponent},
  {path: "schedule", component:ScheduleComponent},
  {path: "tasks", component:TasklistComponent},
  {path: "login", component:LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
