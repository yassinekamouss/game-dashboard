import {Injectable } from "@angular/core";
import { Auth, user } from "@angular/fire/auth";
import { 
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from "firebase/auth";
import { Database, ref, set, get } from '@angular/fire/database';
import { from, Observable } from "rxjs";
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth, private db: Database) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.auth);
  }

  private setSessionStoragePersistence(): void {
    setPersistence(this.auth, browserSessionPersistence);
  }

  login(email: string, password: string): Observable<User | null> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
        .then((cred) => {
          return cred.user;
        })
        .catch((err) => {
          console.error('Login failed:', err.message);
          throw err;
        })
    );
  }

  getCurrentUserWithRole(): Observable<any> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged(user => {
        if (!user) {
          observer.next(null);
          observer.complete();
        } else {
          const userRef = ref(this.db, `users/${user.uid}`);
          from(get(userRef)).subscribe({
            next: snapshot => {
              observer.next(snapshot.val());
              observer.complete();
            },
            error: err => {
              observer.error(err);
            }
          });          
        }
      });
    });
  }

  logout(): Observable<void> {
    return from(
      signOut(this.auth).then(() => sessionStorage.clear())
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