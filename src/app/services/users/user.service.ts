import { Injectable } from '@angular/core';
import { Database, ref, update, get } from '@angular/fire/database';
import { AuthService } from '../auth/auth.service';
import { User } from '../../models/user';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private db: Database,
    private authService: AuthService
  ) { }

  updateUserProfile(userData: Partial<User>): Observable<User | null> {
    // Créer l'objet de mise à jour (inclut seulement les champs modifiables)
    const updates: Partial<User> = {};
    
    // Vérifier chaque champ modifiable
    if (userData.firstName !== undefined) updates.firstName = userData.firstName;
    if (userData.lastName !== undefined) updates.lastName = userData.lastName;
    if (userData.dateOfBirth !== undefined) updates.dateOfBirth = userData.dateOfBirth;
    
    // Référence à l'utilisateur dans la base de données
    const userRef = ref(this.db, `users/${userData.id}`);
    
    // Effectuer la mise à jour dans Firebase
    return from(update(userRef, updates)).pipe(
      // Après la mise à jour réussie, récupérer l'utilisateur complet
      switchMap(() => from(get(userRef))),
      map(snapshot => {
        if (snapshot.exists()) {
          const updatedUser = snapshot.val() as User;
          
          this.authService.updateCurrentUser(updatedUser);
          return updatedUser;
        }
        return null;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return throwError(() => error);
      })
    );
  }
}