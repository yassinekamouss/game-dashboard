import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/shared/profile/profile.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path : 'login', component: LoginComponent},
    {path : 'reset-password', component:ResetPasswordComponent },
    {path: 'admin',component: AdminComponent, children: [
        {path: 'profile', component: ProfileComponent}
    ]},
];
