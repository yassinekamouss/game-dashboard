import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/users/user.service';
import { Student } from '../../../models/student';
import { User } from '../../../models/user';
import { StudentCardComponent } from '../../shared/student-card/student-card.component';
import { Teacher } from '../../../models/teacher';
import {AddUserComponent} from '../../shared/add-user/add-user.component';
import {UserRole} from '../../../models/user-role';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentCardComponent, AddUserComponent],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {

  students: Student[] = [];

  private userSub!: Subscription;
  filteredStudents: Student[] = [];
  teachers: Teacher[] = [];
  isLoading = true;
  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // Filtres
  filters = {
    grade: '',
    gender: '',
    teacherGrade: '',
    search: ''
  };

  showAddUserModal: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    console.log("111")
    this.isLoading = true;
    this.userService.loadUsers(UserRole.STUDENT);

    this.userSub = this.userService.users$.subscribe({
      next:(users:User[]) => {
      this.students = users as Student[] || [];
      this.applyFilters();
      this.isLoading = false;
    },
      error: (error) => {
        console.error('Erreur lors du chargement des eleves :', error);
        this.isLoading = false;
      },
    });


    // Charger les enseignants pour le filtre
    this.userService.getUsersByRole('teacher').subscribe({
      next: (teachers) => {
        this.teachers = teachers as Teacher[];
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des enseignants:', error);
      }
    });
  }



  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }


  applyFilters(): void {
    let filtered = [...this.students];

    // Filtre par niveau
    if (this.filters.grade) {
      filtered = filtered.filter(s => s.grade === this.filters.grade);
    }

    // Filtre par genre
    if (this.filters.gender) {
      filtered = filtered.filter(s => s.gender === this.filters.gender);
    }

    // Filtre par enseignant
    if (this.filters.teacherGrade) {
      filtered = filtered.filter(s => s.grade === this.filters.teacherGrade);
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
      grade: '',
      gender: '',
      teacherGrade: '',
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

  onAddStudentClick(): void {
    this.showAddUserModal = true;
  }


  onUserAdded(user:User): void {
    this.showAddUserModal = false;
    const student = user as Student;
    this.students.unshift(student);
    this.userService.setUsers([...this.students]);
    this.applyFilters();
  }



  protected readonly UserRole = UserRole;

  removeStudent(studentId:string) {
    this.students = this.students.filter(s => s.id !== studentId);
    this.userService.setUsers([...this.students]);
    this.applyFilters();
  }
}
