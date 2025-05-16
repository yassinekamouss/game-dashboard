import { Injectable } from '@angular/core';
import { Database, ref, update, get } from '@angular/fire/database';
import { User } from '../../models/user';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { equalTo, orderByChild, query } from 'firebase/database';
import { Student } from '../../models/student';
import { Parent } from '../../models/parent';


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

  getParentWithChildren(): Observable<Parent[]> {
    return this.getUsersByRole('parent').pipe(
      switchMap((users: User[]) => {
        const parents = users as Parent[];
        if (parents.length === 0) return of([]);

        const parentRequests = parents.map((parent) => {
          const childIds = parent.children as unknown as string[];
          const childObservables = childIds.map((childId) =>
            this.getUserById(childId)
          );

          return forkJoin(childObservables).pipe(
            map((students) => {
              parent.children = students.filter(
                (s): s is Student => s !== null
              );
              return parent;
            })
          );
        });

        return forkJoin(parentRequests).pipe(
          tap((parentsWithChildren) => {
            console.log('Parents avec leurs enfants :', parentsWithChildren);
          })
        );
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des parents:', error);
        return throwError(() => error);
      })
    );
  }
}
