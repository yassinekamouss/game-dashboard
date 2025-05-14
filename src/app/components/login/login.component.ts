import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Database, ref, get } from '@angular/fire/database';
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

  // constructor(private authService: AuthService, private router: Router, private db: Database) {}

  constructor(private authService: AuthService, private router: Router) {
    // Vérifier si l'utilisateur est déjà connecté
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.navigateBasedOnRole(user);
      }
    });
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.errorMessage = '';
    
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          this.navigateBasedOnRole(user);
        } else {
          this.errorMessage = 'Utilisateur introuvable';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.code === 'auth/user-disabled') {
          this.errorMessage = 'Ce compte a été désactivé';
        } else if (error.code === 'auth/too-many-requests') {
          this.errorMessage = 'Trop de tentatives échouées. Veuillez réessayer plus tard';
        } else {
          this.errorMessage = 'Une erreur s\'est produite lors de la connexion';
        }
      }
    });
  }

  private navigateBasedOnRole(user: any) {
    const role = user.role.toLowerCase();
    
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'teacher':
        this.router.navigate(['/teacher']);
        break;
      case 'student':
        this.router.navigate(['/student']);
        break;
      case 'principal':
        this.router.navigate(['/principal']);
        break;
      default:
        this.errorMessage = 'L\'administrateur n\'a pas encore attribué de rôle à cet utilisateur';
        this.router.navigate(['/']);
    }
  }
}