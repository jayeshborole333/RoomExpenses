import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomfellowComponent } from './roomfellow/roomfellow.component';
import { RoomExpensesComponent } from './room-expenses/room-expenses.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'roomfellow', component: RoomfellowComponent },
  { path: 'room-expenses', component: RoomExpensesComponent }
];
