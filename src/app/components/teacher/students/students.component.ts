import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { StudentCardComponent } from '../../shared/student-card/student-card.component';
import { StudentService } from '../../../services/students/student.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Teacher } from '../../../models/teacher';
import { Student } from '../../../models/student';
import { UserRole } from '../../../models/user-role';
import { AddUserComponent } from '../../shared/add-user/add-user.component';

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
  itemsPerPage = 8;
  totalPages = 1;

  // Filtres
  filters = {
    gender: '',
    search: ''
  };

  // Ajout d'élève
  showAddUserModal = false;


  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (teacher) => {
        this.teacher = teacher as Teacher;
        if (this.teacher?.grade) {
          this.loadStudents();
        } else {
          console.warn('Aucun grade trouvé pour l\'enseignant');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'enseignant :', error);
        this.isLoading = false;
      }
    });
  }

  loadStudents(): void {
    if (!this.teacher?.grade) return;

    this.studentService.getStudentsByGrade(this.teacher.grade).subscribe({
      next: (students) => {
        this.students = students;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des étudiants :', error);
        this.isLoading = false;
      }
    });
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

  onUserAdded() {
    this.showAddUserModal = false;
    // Recharger la liste des étudiants après l'ajout
    this.loadStudents();
  }

  protected readonly UserRole = UserRole;
}
