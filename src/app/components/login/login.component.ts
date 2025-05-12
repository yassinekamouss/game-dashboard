import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Database, ref, get } from '@angular/fire/database';
import { User } from 'firebase/auth';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private db: Database) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: async (user: any) => {
        const uid = user.uid;
        // Récupérer l'utilisateur avec sans role
        this.authService.getCurrentUserWithRole().subscribe({
          next: (userWithRole) => {
            if (userWithRole) {
              const role = userWithRole.role;
              if (role === 'admin') {
                console.log('Admin role detected');
                // this.router.navigate(['/admin']);
              } else if (role === 'student') {
                console.log('User role detected');
                this.router.navigate(['/dashboard']);
                // this.router.navigate(['/user']);
              } else {
                this.router.navigate(['/']);
              }
            } else {
              this.router.navigate(['/']);
            }
          },
          error: (error) => {
            console.error('Error fetching user with role:', error);
          },
        });

      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password';
      },
    });
  }
}