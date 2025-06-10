import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, filter, take } from 'rxjs/operators';
import { UserRole } from '../models/user-role';
import { combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return combineLatest([
      this.auth.getCurrentUserWithRole(),
      this.auth.isAuthLoading$
    ]).pipe(
      // On attend que le chargement soit terminé
      filter(([_, loading]) => !loading),
      take(1),
      map(([user]) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        if (user.role === UserRole.PENDING) {
          this.router.navigate(['/pending-users']);
          return false;
        }
        return true;
      })
    );
  }
}
