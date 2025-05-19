import { Component } from '@angular/core';
import { SharedDashboardComponent } from '../shared/shared-dashboard/shared-dashboard.component';
@Component({
  selector: 'app-admin',
  imports: [SharedDashboardComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  standalone: true,
})
export class AdminComponent {
  adminLinks: { label: string; path: string; icon: string }[] = [
    { label: 'Tableau de bord', path: '/admin/dashboard', icon: 'fas fa-home' },
    {
      label: 'Gestion des eleves',
      path: '/admin/students',
      icon: 'fas fa-users-gear',
    },
    {
      label: 'Gestion des parents',
      path: '/admin/parents',
      icon: 'fas fa-users-gear',
    },
    {
      label: 'Performance des classes',
      path: '/admin/classes-performance',
      icon: 'fas fa-graduation-cap',
    },
    {
      label: 'Gestion des profs',
      path: '/admin/teachers',
      icon: 'fas fa-chalkboard-teacher',
    },
    {
      label: 'Utilisateurs en attente',
      path: '/admin/pending-users',
      icon: 'fas fa-user-clock',
    },
    { label: 'Rapports', path: '/admin/reports', icon: 'fas fa-chart-line' },
  ];
}
