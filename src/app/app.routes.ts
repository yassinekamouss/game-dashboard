import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SharedDashboardComponent } from './components/shared-dashboard/shared-dashboard.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path : 'login', component: LoginComponent},
    {path: 'dashboard',component: SharedDashboardComponent}
];
