import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import {UserRole} from '../../models/user-role';
import {FirebaseErrorsService} from '../../services/firebaseErrors/firebase-errors.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  role!:UserRole;

  isVisible = false;


  // constructor(private authService: AuthService, private router: Router, private db: Database) {}

  constructor(private authService: AuthService,
              private router: Router ,
              private firebaseError:FirebaseErrorsService) {
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
      this.errorMessage = this.firebaseError.getErrorMessage(error);
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
      case 'pending':
        this.isVisible = true;
        this.authService.logout();
        break
      default:
        this.errorMessage = 'L\'administrateur n\'a pas encore attribué de rôle à cet utilisateur';
        this.router.navigate(['/']);
    }
  }


  close() {
    this.isVisible = false;
  }

  protected readonly UserRole = UserRole;
}
