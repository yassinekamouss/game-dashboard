import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/shared/profile/profile.component';
import { StudentsComponent as AdminStudentComponent } from './components/admin/students/students.component';
import {TeacherComponent} from './components/teacher/teacher.component';
import {StudentsComponent as TeacherStudentComponent} from './components/teacher/students/students.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path : 'login', component: LoginComponent},
    {path : 'reset-password', component:ResetPasswordComponent },
    {path: 'admin',component: AdminComponent, children: [
        {path: 'profile', component: ProfileComponent},
        {path: 'students', component: AdminStudentComponent}
    ]},
  {path:'teacher', component : TeacherComponent , children:[
      {path: 'profile' , component: ProfileComponent},
      {path: 'students' ,component: TeacherStudentComponent}
    ]}
];
