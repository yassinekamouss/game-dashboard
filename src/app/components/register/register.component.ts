import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {UserRole} from '../../models/user-role';
import {AuthService} from '../../services/auth/auth.service';
import {User} from '../../models/user';
import {FirebaseErrorsService} from '../../services/firebase-errors.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink , CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone:true
})
export class RegisterComponent {

  firstName:string = '';
  lastName:string = '';
  email:string= '';
  password:string = '';
  confirmPassword:string = '';
  role:string = UserRole.PENDING;
  gender:string = '';
  dateOfBirth : string = '';
  errorMessage = '';
  showSuccessModal = false;
  constructor(private authService : AuthService ,
              private  firebaseError : FirebaseErrorsService
  ) {}

  onRegister() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.registerUser(this.email, this.password).subscribe({
      next: (cred) => {
        const uid = cred.user.uid;
        const newUser: User = {
          id: uid,
          firstName: this.firstName,
          lastName: this.lastName,
          gender: this.gender,
          email: this.email,
          dateOfBirth: this.dateOfBirth,
          role: this.role,
        } as User;

        this.authService.saveUserToDatabase(newUser).subscribe({
          next: () => {
            console.log('Utilisateur enregistré avec succès');
            this.showSuccessModal = true;
          },
          error: (err) => {
         this.errorMessage =  this.firebaseError.getErrorMessage(err); // gestion erreur sauvegarde user
          }
        });
      },
      error: (err) => {
      this.errorMessage = this.firebaseError.getErrorMessage(err); // 🔴 GESTION ERREUR INSCRIPTION
      }
    });



  }
  closeModal(){
    this.showSuccessModal = false;
  }

  handleFirebaseError(err: any) {
    console.error('Firebase error:', err);

    const code = err.code || '';

    switch (code) {
      case 'auth/email-already-in-use':
        this.errorMessage = "Cet email est déjà utilisé. Veuillez en choisir un autre.";
        break;
      case 'auth/invalid-email':
        this.errorMessage = "L'email saisi n'est pas valide.";
        break;
      case 'auth/weak-password':
        this.errorMessage = "Le mot de passe est trop faible. Minimum 6 caractères.";
        break;
      case 'auth/network-request-failed':
        this.errorMessage="Erreur réseau. Vérifiez votre connexion.";
        break;
      default:
        this.errorMessage= "Une erreur inattendue est survenue : " + err.message;
        break;
    }
  }
}
