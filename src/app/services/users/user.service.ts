import { Injectable } from '@angular/core';
import { Database, ref, update, get } from '@angular/fire/database';
import { User } from '../../models/user';
import { from, Observable, Subject, throwError} from 'rxjs';
import { catchError, map, switchMap  } from 'rxjs/operators';
import { equalTo, orderByChild, query } from 'firebase/database';
import {UserRole} from '../../models/user-role';


@Injectable({
  providedIn: 'root'
})
export class UserService {


  private usersSubject$ = new Subject<User[]>();

  users$ = this.usersSubject$.asObservable();

  constructor(private db: Database) {}

  updateUserProfile(userData: Partial<User>): Observable<User | null> {
    if (!userData.id) {
      return throwError(() => new Error('ID utilisateur manquant pour la mise à jour.'));
    }

    const updates: Partial<User> = {};
    if (userData.firstName !== undefined) updates.firstName = userData.firstName;
    if (userData.lastName !== undefined) updates.lastName = userData.lastName;
    if (userData.dateOfBirth !== undefined) updates.dateOfBirth = userData.dateOfBirth;

    const userRef = ref(this.db, `users/${userData.id}`);

    return from(update(userRef, updates)).pipe(
      switchMap(() => from(get(userRef))),
      map(snapshot => {
        if (snapshot.exists()) {
          return snapshot.val() as User;
        }
        return null;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil :', error);
        return throwError(() => error);
      })
    );
  }

  getUsersByRole(role: string): Observable<User[]> {
    const usersQuery = query(
      ref(this.db, 'users'),
      orderByChild('role'),
      equalTo(role.toLowerCase())
    );

    return from(get(usersQuery)).pipe(
      map(snapshot => {
        const users: User[] = [];
        if (snapshot.exists()) {
          snapshot.forEach(childSnapshot => {
            const user = childSnapshot.val() as User;
            users.push(user);
          });
        }
        return users;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        return throwError(() => error);
      })
    );
  }


    getUserById(childId: string): Observable<User | null> {
    const childRef = ref(this.db, `users/${childId}`);

    return from(get(childRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val() as User;
        }
        return null;
      }),
      catchError((error) => {
        console.error("Erreur lors de la récupération de l'enfant:", error);
        return throwError(() => error);
      })
    );
  }

  // Charge les users et push dans le subject
  loadUsers(role: UserRole): void {
    this.getUsersByRole(role).subscribe(users => {
      this.usersSubject$.next(users);
    });
  }

  // Méthode pour mettre à jour la liste (après ajout, filtre, etc.)
  setUsers(users: User[]): void {
    this.usersSubject$.next(users);
  }


  updateFullUser(user: User): Observable<User | null> {
    if (!user.id) {
      return throwError(() => new Error('ID utilisateur manquant pour la mise à jour.'));
    }

    const userRef = ref(this.db, `users/${user.id}`);

    return from(update(userRef, { ...user })).pipe(
      switchMap(() => from(get(userRef))),
      map(snapshot => {
        if (snapshot.exists()) {
          return snapshot.val() as User;
        }
        return null;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour complète de l’utilisateur :', error);
        return throwError(() => error);
      })
    );
  }

}
