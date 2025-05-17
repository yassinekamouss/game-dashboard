import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-role';
import { Parent } from '../../../models/parent';
import { GradeLevel } from '../../../models/grade-level';
import {catchError, finalize, switchMap, take, tap} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
import {UserFactory} from '../../../factories/user.factory';
import {Teacher} from '../../../models/teacher';
import {Administrator} from '../../../models/administrator';
import {Student} from '../../../models/student';
import {StudentService} from '../../../services/students/student.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup;
  currentUser: User  | null = null;
  successMessage: string = '';
  showSuccess: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  grades = Object.values(GradeLevel);
  teacherGrade: string = '';
  availableStudents:Student[] = [];
  selectedStudents:string[] =[];


  @Input() role!: UserRole;
  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<User>();



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private studentService:StudentService
  ) {
    console.log('AddUserComponent initialized');

    // Formulaire unique avec toutes les informations nécessaires
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      role: [''],

      grade: [''],
      children: ['']
    });
  }


  ngOnInit() {
    this.userForm.patchValue({role: this.role});

    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      this.currentUser = user;

      // Définir les validateurs conditionnels en fonction du rôle
      if (this.role === UserRole.STUDENT || this.role === UserRole.TEACHER) {
        this.userForm.get('grade')?.setValidators([Validators.required]);
      }

      if (this.currentUser?.role === UserRole.TEACHER && this.role === UserRole.STUDENT) {
        this.teacherGrade = (this.currentUser as Teacher).grade;
        this.userForm.get('grade')?.setValue(this.teacherGrade);
      }

      if (this.role === UserRole.PARENT && this.currentUser?.role === UserRole.ADMIN) {
        this.studentService.getStudentsWithoutParent().subscribe(students =>{
          this.availableStudents = students;
        })
        this.userForm.get('children')?.setValidators([Validators.required]);
      }

      this.userForm.updateValueAndValidity();
    });
  }

  onStudentSelectionChange(event: Event, studentId: string) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      // Ajouter l'étudiant à la liste des sélectionnés
      this.selectedStudents.push(studentId);
    } else {
      // Retirer l'étudiant de la liste des sélectionnés
      const index = this.selectedStudents.indexOf(studentId);
      if (index !== -1) {
        this.selectedStudents.splice(index, 1);
      }
    }
    this.userForm.patchValue({ children: this.selectedStudents });
  }

  onSaveUser() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showErrorMessage("Vous n'êtes plus connecté. Veuillez vous reconnecter avant de continuer.");
      return;
    }

    this.isSubmitting = true;
    this.showError = false;

    const formValues = this.userForm.getRawValue();
    const { email, password } = formValues;

    if (this.role === UserRole.PARENT) {
      formValues.children = this.selectedStudents;
    }

    this.authService.registerUser(email, password)
      .pipe(
        switchMap((cred) => {
          const firebaseUID = cred.user.uid;
          const userData = UserFactory.createUser(firebaseUID,this.role,formValues);

          return this.authService.saveUserToDatabase(userData).pipe(
            switchMap(() => {
              if (this.role === UserRole.PARENT && this.selectedStudents.length > 0) {
                // APPEL au service student ici
                return this.studentService.updateParentIdForStudents(userData.id, this.selectedStudents);
              } else {
                return of(void 0);
              }
            }),
              tap(() => {
                this.showSuccessMessage(userData);
                this.userCreated.emit(userData);
                this.userForm.reset();
            }),
            catchError((err) => {
              console.error('Database save failed, rolling back Firebase user creation.');
              return this.authService.deleteUser(firebaseUID).pipe(
                switchMap(() => throwError(() => err))
              );
            })
          );
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          console.log('User successfully created and saved.');
        },
        error: (err) => {
          this.handleFirebaseError(err);
        }
      });

  }


  handleFirebaseError(err: any) {
    console.error('Firebase error:', err);

    const code = err.code || '';

    switch (code) {
      case 'auth/email-already-in-use':
        this.showErrorMessage("Cet email est déjà utilisé. Veuillez en choisir un autre.");
        break;
      case 'auth/invalid-email':
        this.showErrorMessage("L'email saisi n'est pas valide.");
        break;
      case 'auth/weak-password':
        this.showErrorMessage("Le mot de passe est trop faible. Minimum 6 caractères.");
        break;
      case 'auth/network-request-failed':
        this.showErrorMessage("Erreur réseau. Vérifiez votre connexion.");
        break;
      default:
        this.showErrorMessage("Une erreur inattendue est survenue : " + err.message);
        break;
    }
  }

  showSuccessMessage(userData: User) {
    const roleName = this.getRoleLabel().toLowerCase();
    this.successMessage = `${roleName} ${userData.firstName} ${userData.lastName} a été ajouté avec succès!`;
    this.showSuccess = true;
    this.showError = false;

    // Masquer le message après quelques secondes
    setTimeout(() => {
      this.showSuccess = false;
    }, 5000);
  }

  // Afficher un message d'erreur
  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    this.showSuccess = false;

    // Masquer le message après quelques secondes
    setTimeout(() => {
      this.showError = false;
    }, 7000);
  }


  getRoleLabel(): string {
    switch (this.role) {
      case UserRole.STUDENT: return 'Étudiant';
      case UserRole.TEACHER: return 'Enseignant';
      case UserRole.PARENT: return 'Parent';
      case UserRole.ADMIN: return 'Administrateur';
      default: return 'Utilisateur';
    }
  }

  closeModal() {
    this.close.emit();
  }

  protected readonly UserRole = UserRole;
}
