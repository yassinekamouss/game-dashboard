import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/shared/profile/profile.component';
import { StudentsComponent as AdminStudentComponent } from './components/admin/students/students.component';
import { DashboardComponent as AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { ParentsComponent as AdminParentComponent} from './components/admin/parents/parents.component';
import { TeachersComponent as AdminTeachersComponent } from './components/admin/teachers/teachers.component';
import { TeacherComponent } from './components/teacher/teacher.component';
import { StudentsComponent as TeacherStudentComponent } from './components/teacher/students/students.component';
import {RegisterComponent} from './components/register/register.component';
import {PendingUsersComponent} from './components/admin/pending-users/pending-users.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path : 'login', component: LoginComponent},
    {path : 'reset-password', component:ResetPasswordComponent },
    {path:'register' , component:RegisterComponent},
    {path: 'admin',component: AdminComponent, children: [
        {path: 'dashboard', component: AdminDashboardComponent },
        {path: 'profile', component: ProfileComponent},
        {path: 'students', component: AdminStudentComponent},
        {path: 'parents', component: AdminParentComponent },
        {path: 'teachers', component: AdminTeachersComponent },
        {path: 'pending-users' , component: PendingUsersComponent}
    ]},
  {path:'teacher', component : TeacherComponent , children:[
      {path: 'profile' , component: ProfileComponent},
      {path: 'students' ,component: TeacherStudentComponent}
    ]}
];
