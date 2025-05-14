import { Component } from '@angular/core';
import {SharedDashboardComponent} from '../shared/shared-dashboard/shared-dashboard.component';

@Component({
  selector: 'app-teacher',
  imports: [
    SharedDashboardComponent
  ],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css',
  standalone:true
})
export class TeacherComponent {
  teacherLinks: { label: string; path: string; icon: string }[] = [
    { label: 'Tableau de bord',
      path: '/teacher/dashboard',
      icon: 'fas fa-home'
    },
    {
      label: 'Gestion des eleves',
      path: '/teacher/students',
      icon: 'fas fa-users-gear',
    },
    {
      label: 'tests',
      path: '/teacher/tests',
      icon: 'fas fa-file-alt',
    },
  ];
}
