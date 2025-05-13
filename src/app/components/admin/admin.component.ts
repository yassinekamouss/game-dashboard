import { Component } from '@angular/core';
import { SharedDashboardComponent } from '../shared-dashboard/shared-dashboard.component';
@Component({
  selector: 'app-admin',
  imports: [SharedDashboardComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  adminLinks : { label: string; path: string; icon: string }[] = [
    { label: 'Tableau de bord', path: '/admin/dashboard', icon: "fas fa-home" },
    { label: 'Gestion des eleves', path: '/admin/students', icon: "fas fa-user-cog" },
    { label: 'Gestion des parents', path: '/admin/parents', icon: "fas fa-user-cog" },
    { label: 'Gestion des profs', path: '/admin/professeurs', icon: "fas fa-cogs" },
    { label: 'Rapports', path: '/admin/reports', icon: "fas fa-chart-line"}
  ]
}
