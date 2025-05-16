import { Injectable } from '@angular/core';
import { Database, ref, update, get, child } from '@angular/fire/database';
import { User } from '../../models/user';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { equalTo, orderByChild, query } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class UserService {

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

  addStudentToTeacher(teacherId: string, studentId: string): Promise<void> {
    const teacherStudentsRef = ref(this.db, `teachers/${teacherId}/students`);
    return update(teacherStudentsRef, { [studentId]: true });
  }

  addStudentToParent(parentId: string, studentId: string): Promise<void> {
    const parentChildrenRef = ref(this.db, `parents/${parentId}/children`);
    return update(parentChildrenRef, { [studentId]: true });
  }
}
