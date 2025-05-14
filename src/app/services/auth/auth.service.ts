import {Injectable } from "@angular/core";
import { Auth, user } from "@angular/fire/auth";
import { 
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser
} from "firebase/auth";
import { Database, ref, set, get } from '@angular/fire/database';
import { BehaviorSubject, from, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { User } from "../../models/user";

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<FirebaseUser | null>;

  // BehaviorSubject pour stocker l'utilisateur avec son rôle
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Observable exposé publiquement pour les composants
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private db: Database) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.auth);
    console.log('consotractor !!:', );
    // Configurer la surveillance d'authentification
    this.setupAuthStateListener(); 
  }

  private setSessionStoragePersistence(): void {
    setPersistence(this.auth, browserSessionPersistence);
  }

  // Récupération des données utilisateur avec son rôle
  private fetchUserWithRole(uid: string): Observable<User | null> {
    console.log('fetchUserWithRole called with uid:', uid);
    const userRef = ref(this.db, `users/${uid}`);
    
    return from(get(userRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Mettre à jour le BehaviorSubject et le stockage
          this.currentUserSubject.next(userData);
          return userData;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    );
  }

  login(email: string, password: string): Observable<User | null> {
    console.log('login called with email:', email);
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap(cred => {
        // Après authentification Firebase, récupérer les données utilisateur
        return this.fetchUserWithRole(cred.user.uid);
      }),
      catchError(err => {
        console.error('Login failed:', err.message);
        return throwError(() => err);
      })
    );
  }

  // Méthode réactive pour obtenir l'utilisateur courant avec son rôle
  getCurrentUserWithRole(): Observable<User | null> {
    return this.currentUser$;
  }

  // Ajouter cette méthode dans auth.service.ts
  setCurrentUser(user: User): void {
    // Met à jour le BehaviorSubject, ce qui notifie tous les abonnés
    this.currentUserSubject.next(user);
  }

  // Configuration de l'écouteur d'état d'authentification
  private setupAuthStateListener(): void {
   
    console.log('setupAuthStateListener called');
    this.user$.subscribe(firebaseUser => {
      console.log('Utilisateur connecté:', firebaseUser);
      if (firebaseUser) {
        // L'utilisateur est connecté, récupérez ses données complètes
        this.fetchUserWithRole(firebaseUser.uid).subscribe();
      } else {
        // L'utilisateur est déconnecté
        this.currentUserSubject.next(null);
      }
    });
  }

  // Récupérer l'utilisateur actuel (synchrone)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): Observable<void> {
    return from(
      signOut(this.auth).then(() => {
        // sessionStorage.clear();
        this.currentUserSubject.next(null);
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(
      sendPasswordResetEmail(this.auth, email).then(() => {
        console.log('Lien de réinitialisation envoyé à :', email);
      }).catch((err) => {
        console.error('Erreur lors de l\'envoi du lien :', err.message);
        throw err;
      })
    );
  }
}