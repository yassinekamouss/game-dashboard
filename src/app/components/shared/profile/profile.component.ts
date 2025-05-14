import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/users/user.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  profileForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: [''],
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.resetForm();
      }
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.resetForm();
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  resetForm(): void {
    if (this.user) {
      this.profileForm.setValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        dateOfBirth: this.user.dateOfBirth,
        email: this.user.email,
        role: this.user.role
      });
    }
  }

  saveChanges(): void {
    if (this.profileForm.valid && this.user) {
      const updatedUser = {
        ...this.user,
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        dateOfBirth: this.profileForm.value.dateOfBirth
      };
      
      this.userService.updateUserProfile(updatedUser).subscribe({
        next : (user) => {
          if (user) {
            console.log('Profil mis à jour avec succès');
            this.isEditing = false;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil:', error);
        }
      })
    }
  }
}