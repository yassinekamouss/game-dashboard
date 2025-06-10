import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { set } from 'firebase/database';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'teacher-dashboard';


isLoading = true;
constructor(private auth: AuthService) {
  this.auth.isAuthLoading$.subscribe(loading => {
   
      // Simulate a delay for loading state
    this.isLoading = loading;

  });
}

}
