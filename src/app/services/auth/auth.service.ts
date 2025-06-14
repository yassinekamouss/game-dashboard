import {Injectable} from "@angular/core";
import {Auth, getAuth, user} from "@angular/fire/auth";
import {FirebaseApp, initializeApp} from '@angular/fire/app';
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {Database, get, ref, set} from '@angular/fire/database';
import {BehaviorSubject, from, Observable, of, throwError} from "rxjs";
import {catchError, finalize, map, switchMap, tap} from "rxjs/operators";
import {User} from "../../models/user";
import {environment} from '../../environments/environment';
import {UserRole} from '../../models/user-role';
import {UserService} from '../users/user.service';
import {Parent} from '../../models/parent';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private secondaryApp: FirebaseApp;

  user$: Observable<FirebaseUser | null>;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  private isAuthLoadingSubject = new BehaviorSubject<boolean>(true);
  public isAuthLoading$ = this.isAuthLoadingSubject.asObservable();


  private isCreatingUser = false;

  constructor(private auth: Auth, private db: Database , private userService: UserService) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.auth);
    this.setupAuthStateListener();

    this.secondaryApp = initializeApp(environment.firebaseConfig, 'secondary');
  }



  private setSessionStoragePersistence(): void {
    setPersistence(this.auth, browserSessionPersistence).catch(error => {
      console.error('Error setting persistence:', error);
    });
  }

  private fetchUserWithRole(uid: string): Observable<User | null> {
    const userRef = ref(this.db, `users/${uid}`);

    return from(get(userRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          this.currentUserSubject.next(userData);
          return userData;
        }
        console.log('No user data found for UID:', uid);
        return null;
      }),
      catchError(error => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    );
  }

  login(email: string, password: string): Observable<User | null> {
    console.log('Login attempt for:', email);

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(cred => {
        console.log('Firebase login successful, fetching user data');
        return this.fetchUserWithRole(cred.user.uid);
      }),
      tap(user => {
        console.log('Login completed with user:', user?.firstName);
      }),
      catchError(err => {
        console.error('Login failed:', err.message);
        return throwError(() => err);
      })
    );
  }

  getCurrentUserWithRole(): Observable<User | null> {
    return this.currentUser$;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  private setupAuthStateListener(): void {
    this.user$.subscribe(firebaseUser => {
      console.log('Auth state changed, user:', firebaseUser?.email);

      if (this.isCreatingUser) {
        console.log('Ignoring auth state change during user creation');
        return;
      }

      if (firebaseUser) {
        this.fetchUserWithRole(firebaseUser.uid).subscribe(() => {
          this.isAuthLoadingSubject.next(false); // <-- ici, après avoir chargé l'utilisateur
        });
      } else {
        console.log('User logged out, clearing current user');
        this.currentUserSubject.next(null);
        this.isAuthLoadingSubject.next(false);
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): Observable<void> {
    console.log('Logging out');
    return from(signOut(this.auth).then(() => {
      this.currentUserSubject.next(null);
    }));
  }

  resetPassword(email: string): Observable<void> {
    return from(
      sendPasswordResetEmail(this.auth, email).then(() => {
        console.log('Password reset link sent to:', email);
      }).catch((err) => {
        console.error('Error sending reset link:', err.message);
        throw err;
      })
    );
  }

  createUserWithoutSigningIn(email: string, password: string): Observable<any> {
    const secondaryAuth = getAuth(this.secondaryApp);

    this.isCreatingUser = true;

    return from(createUserWithEmailAndPassword(secondaryAuth, email, password)).pipe(
      tap(() => {
        console.log('User created in secondary app');
      }),
      switchMap(cred => {
        return from(signOut(secondaryAuth)).pipe(
          map(() => cred)
        );
      }),
      finalize(() => {
        this.isCreatingUser = false;
      }),
      catchError(error => {
        this.isCreatingUser = false;
        console.error('Error creating user in secondary app:', error);
        return throwError(() => error);
      })
    );
  }

  registerUser(email: string, password: string): Observable<any> {
    return this.createUserWithoutSigningIn(email, password);
  }

  saveUserToDatabase(user: User): Observable<void> {
    const userRef = ref(this.db, `users/${user.id}`);


    console.log('Saving user to database:', user);

    return from(set(userRef, user)).pipe(
      tap(() => {
        console.log('User saved to database successfully:', user.id);
      }),
      catchError(error => {
        console.error('Error saving user to database:', error);
        return throwError(() => error);
      })
    );
  }


deleteUser(uid: string): Observable<void> {
  return this.userService.getUserById(uid).pipe(
    switchMap(user => {
      if (!user) {
        return throwError(() => new Error('Utilisateur introuvable'));
      }
      if (user.role === UserRole.PARENT && Array.isArray((user as Parent).children)) {
        const childrenIds: string[] = (user as Parent).children;
        const updates = childrenIds.map(childId => {
          const childRef = ref(this.db, `users/${childId}/parentId`);
          return set(childRef, "");
        });
        return from(Promise.all(updates)).pipe(
          switchMap(() => {
            const userRef = ref(this.db, `users/${uid}`);
            return from(set(userRef, null)).pipe(
              tap(() => console.log(`Parent ${uid} et ses liens enfants supprimés de la DB`))
            );
          })
        );
      } else {
        // Suppression simple pour les autres rôles
        const userRef = ref(this.db, `users/${uid}`);
        return from(set(userRef, null)).pipe(
          tap(() => console.log(`User ${uid} deleted from database`))
        );
      }
    }),
    catchError(error => {
      console.error('Error deleting user from database:', error);
      return throwError(() => error);
    })
  );
}


}
