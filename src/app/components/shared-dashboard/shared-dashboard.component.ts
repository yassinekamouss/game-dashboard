import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-shared-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './shared-dashboard.component.html',
  styleUrls: ['./shared-dashboard.component.css']
})

export class SharedDashboardComponent  {
  @Input() links: { label: string; path: string; icon: string }[] = [];
  
  constructor(
    private authService: AuthService, 
    private router: Router,
  ) {}
  
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed:', err.message);
      },
    });
  }

}