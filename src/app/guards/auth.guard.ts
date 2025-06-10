import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';
import {UserRole} from '../models/user-role';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return this.auth.getCurrentUserWithRole().pipe(
      take(1),
      map(user => {
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
