import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Student} from '../../../models/student';
import {CommonModule} from '@angular/common';
import {GradeLevel} from '../../../models/grade-level';
import {AuthService} from '../../../services/auth/auth.service';
import {User} from '../../../models/user';
import {UserRole} from '../../../models/user-role';
import {Teacher} from '../../../models/teacher';
import {UserService} from '../../../services/users/user.service';

@Component({
  selector: 'app-modify-student',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './modify-student-OR-teacher.component.html',
  styleUrl: './modify-student-OR-teacher.component.css',
  standalone: true
})
export class ModifyStudentORTeacherComponent implements OnInit, OnChanges {

  @Input() user!: Student | Teacher | null;
  @Output() studentModified = new EventEmitter<Student>();
  @Output() teacherModified = new EventEmitter<Teacher>();
  @Output() close = new EventEmitter<void>();
  roleOfUser! : UserRole.STUDENT | UserRole.TEACHER | undefined;

  role : string = '';



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

    this.roleOfUser  = this.user?.role;

    if (this.roleOfUser === UserRole.TEACHER) this.role = 'enseignant';
    else if(this.roleOfUser === UserRole.STUDENT) this.role = 'élève';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.initForm();
    }
  }

  initForm() {
    this.studentForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      dateOfBirth: [this.user?.dateOfBirth || '', Validators.required],
      gender: [this.user?.gender || '', Validators.required],
      grade: [this.user?.grade || '', Validators.required]
    });
  }

  closeModal() {
    this.close.emit();
  }

  onSave() {
    if (this.studentForm.valid && this.user) {
      // Si l'utilisateur n'est pas admin, on garde l'ancien grade
      let formValue = this.studentForm.value;
      if (this.currentUser?.role !== UserRole.ADMIN) {
        formValue = { ...formValue, grade: this.user.grade };
      }

      const updated: User = {
        ...this.user,
        ...formValue
      };

      this.userService.updateFullUser(updated).subscribe({
        next: (user) => {
          if (user) {
            if(user.role === UserRole.STUDENT)
            this.studentModified.emit(user as Student);
          else if(user.role ===UserRole.TEACHER)
            this.teacherModified.emit(user as Teacher);
          this.closeModal();
          }

        },
        error: () => {

          this.closeModal();
        }
      });
    }
  }

  protected readonly UserRole = UserRole;
}
