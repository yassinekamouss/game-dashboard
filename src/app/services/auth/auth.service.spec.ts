import { Injectable } from "@angular/core";
import { Auth, user, getAuth } from "@angular/fire/auth";
import { FirebaseApp, initializeApp } from '@angular/fire/app';
import {
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { Database, ref, set, get } from '@angular/fire/database';
import { BehaviorSubject, from, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap, tap, finalize } from "rxjs/operators";
import { User } from "../../models/user";
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private secondaryApp: FirebaseApp;
  user$: Observable<FirebaseUser | null>;

  // BehaviorSubject pour stocker l'utilisateur actuel avec son rôle
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Stocker explicitement les informations d'identification pour réauthentification
  private currentCredentials: { email: string, password: string } | null = null;

  // Observable public pour les composants
  public currentUser$ = this.currentUserSubject.asObservable();

  // Indicateur pour suivre les opérations d'authentification
  private isCreatingUser = false;

  constructor(private auth: Auth, private db: Database) {
    console.log('AuthService initialized');
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
    console.log('Fetching user data for UID:', uid);
    const userRef = ref(this.db, `users/${uid}`);

    return from(get(userRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log('User data fetched:', userData);
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

    // Stocker les identifiants pour réauthentification
    this.currentCredentials = { email, password };

    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    ).pipe(
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
    console.log('Setting current user:', user?.firstName);
    this.currentUserSubject.next(user);
  }

  // Configuration améliorée de l'écouteur d'état d'authentification
  private setupAuthStateListener(): void {
    this.user$.subscribe(firebaseUser => {
      console.log('Auth state changed, user:', firebaseUser?.email);

      // Si nous sommes en train de créer un utilisateur, ignorez les changements d'état
      if (this.isCreatingUser) {
        console.log('Ignoring auth state change during user creation');
        return;
      }

      if (firebaseUser) {
        // L'utilisateur est connecté, récupérez ses données complètes
        this.fetchUserWithRole(firebaseUser.uid).subscribe();
      } else {
        // L'utilisateur est déconnecté
        console.log('User logged out, clearing current user');
        this.currentUserSubject.next(null);

        // Si nous avons des identifiants et ce n'est pas une opération de création
        // Tentative de reconnexion automatique si nous avons des identifiants
        if (this.currentCredentials && !this.isCreatingUser) {
          console.log('Attempting automatic reconnection');
          const { email, password } = this.currentCredentials;
          signInWithEmailAndPassword(this.auth, email, password)
            .then(cred => {
              console.log('Auto reconnection successful');
              this.fetchUserWithRole(cred.user.uid).subscribe();
            })
            .catch(err => {
              console.error('Auto reconnection failed:', err);
            });
        }
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): Observable<void> {
    console.log('Logging out');
    return from(
      signOut(this.auth).then(() => {
        this.currentUserSubject.next(null);
        this.currentCredentials = null;
      })
    );
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

  // Méthode completely rewritten pour créer un utilisateur sans se déconnecter
  createUserWithoutSigningIn(email: string, password: string): Observable<any> {
    const secondaryAuth = getAuth(this.secondaryApp);

    return from(createUserWithEmailAndPassword(secondaryAuth, email, password)).pipe(
      switchMap(cred => {
        console.log('Nouvel utilisateur créé dans secondaryAuth');
        // Déconnecter immédiatement le nouvel utilisateur
        return from(signOut(secondaryAuth));
      }),
      catchError(error => {
        console.error('Erreur création utilisateur:', error);
        return throwError(() => error);
      })
    );
  }

  // Cette méthode est utilisée par le AddUserComponent
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
}
