import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseErrorsService {

  constructor() { }


  getErrorMessage(error: any): string {
    const code = error?.code || '';

    switch (code) {
      case 'auth/email-already-in-use':
        return "Cet email est déjà utilisé. Veuillez en choisir un autre.";
      case 'auth/invalid-email':
        return "L'email saisi n'est pas valide.";
      case 'auth/weak-password':
        return "Le mot de passe est trop faible. Minimum 6 caractères.";
      case 'auth/user-not-found':
        return "Utilisateur non trouvé.";
      case 'auth/wrong-password':
        return "Mot de passe incorrect.";
      case 'auth/network-request-failed':
        return "Erreur réseau. Vérifiez votre connexion.";
      default:
        return "Une erreur inattendue est survenue : " + (error?.message || 'Erreur inconnue.');
    }
  }
}
