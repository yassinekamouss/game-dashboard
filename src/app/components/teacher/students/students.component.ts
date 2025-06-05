import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {StudentCardComponent} from '../../shared/student-card/student-card.component';
import {StudentService} from '../../../services/students/student.service';
import {AuthService} from '../../../services/auth/auth.service';
import {Teacher} from '../../../models/teacher';
import {Student} from '../../../models/student';
import {UserRole} from '../../../models/user-role';
import {AddUserComponent} from '../../shared/add-user/add-user.component';
import {UserService} from '../../../services/users/user.service';
import {Subscription} from 'rxjs';
import {User} from '../../../models/user';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    StudentCardComponent,
    AddUserComponent
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {

  students: Student[] = [];
  filteredStudents: Student[] = [];
  teacher: Teacher | null = null;
  isLoading = true;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // Filtres
  filters = {
    gender: '',
    search: ''
  };

  // Ajout d'élève
  showAddUserModal = false;

  private studentSub!:Subscription;

  constructor(
    private studentService: StudentService,
    private userService:UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.currentUser$.subscribe({
      next: (teacher) => {
        this.teacher = teacher as Teacher;
        if (this.teacher?.grade) {
          this.studentService.loadStudents(this.teacher.grade);
        }
        this.studentSub = this.studentService.students$.subscribe({
          next: (students: Student[]) => {
            this.students = students;
            this.applyFilters();
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'enseignant :', error);
        this.isLoading = false;
      }
    });
  }
  ngOnDestroy(): void {
    if (this.studentSub) {
      this.studentSub.unsubscribe();
    }
  }




  applyFilters(): void {
    let filtered = [...this.students];

    // Filtre par genre
    if (this.filters.gender) {
      filtered = filtered.filter(s => s.gender === this.filters.gender);
    }

    // Recherche par nom ou prénom
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search)
      );
    }

    // Mettre à jour les résultats filtrés et la pagination
    this.filteredStudents = filtered;
    this.totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
    this.currentPage = 1; // Retour à la première page après filtrage
  }

  resetFilters(): void {
    this.filters = {
      gender: '',
      search: ''
    };
    this.applyFilters();
  }

  // Pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onAddStudent() {
    this.showAddUserModal = true;
  }

  onUserAdded(user:User) {
    this.showAddUserModal = false;
    const student = user as Student;
    this.students.push(student);
    this.userService.setUsers([...this.students]);
  }

  protected readonly UserRole = UserRole;
}
