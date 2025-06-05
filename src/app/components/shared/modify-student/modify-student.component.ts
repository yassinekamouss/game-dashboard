import {Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {Student} from '../../../models/student';
import { CommonModule } from '@angular/common';
import { GradeLevel } from '../../../models/grade-level';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-role';
import { Teacher } from '../../../models/teacher';
import { Administrator } from '../../../models/administrator';
import { UserService } from '../../../services/users/user.service';

@Component({
  selector: 'app-modify-student',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './modify-student.component.html',
  styleUrl: './modify-student.component.css',
  standalone: true
})
export class ModifyStudentComponent implements OnInit, OnChanges {

  @Input() student!: Student | null;
  @Output() studentModified = new EventEmitter<Student>();
  @Output() close = new EventEmitter<void>();

  currentUser: User | null = null;

  studentForm!: FormGroup;
  grades = Object.values(GradeLevel);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.initForm();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['student'] && this.student) {
      this.initForm();
    }
  }

  initForm() {
    this.studentForm = this.fb.group({
      firstName: [this.student?.firstName || '', Validators.required],
      lastName: [this.student?.lastName || '', Validators.required],
      dateOfBirth: [this.student?.dateOfBirth || '', Validators.required],
      gender: [this.student?.gender || '', Validators.required],
      grade: [this.student?.grade || '', Validators.required]
    });
  }

  closeModal() {
    this.close.emit();
  }

  onSave() {
    if (this.studentForm.valid && this.student) {
      // Si l'utilisateur n'est pas admin, on garde l'ancien grade
      let formValue = this.studentForm.value;
      if (this.currentUser?.role !== UserRole.ADMIN) {
        formValue = { ...formValue, grade: this.student.grade };
      }
      const updated: Student = {
        ...this.student,
        ...formValue
      };

      this.userService.updateFullUser(updated).subscribe({
        next: (user) => {
          if (user) {
            this.studentModified.emit(user as Student);
          }
          this.closeModal();
        },
        error: () => {
          // Optionnel : gestion d'erreur
          this.closeModal();
        }
      });
    }
  }

  protected readonly UserRole = UserRole;
}