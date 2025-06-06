import {Component, OnInit} from '@angular/core';
import {Teacher} from '../../../models/teacher';
import {UserService} from '../../../services/users/user.service';
import {User} from '../../../models/user';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TeacherCardComponent} from '../../shared/teacher-card/teacher-card.component';
import {AddUserComponent} from "../../shared/add-user/add-user.component";
import {UserRole} from '../../../models/user-role';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-teachers',
    imports: [CommonModule, FormsModule, TeacherCardComponent, AddUserComponent],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css',
  standalone: true,
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // Filtres
  filters = {
    grade: '',
    search: ''
  };

  showAddUserModal:boolean=false;

  private userSub! :Subscription ;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.loadUsers(UserRole.TEACHER);
    this.isLoading = true;

    this.userSub = this.userService.users$.subscribe({
    next: (teachers: User[]) => {
      this.teachers = teachers as Teacher[];
      this.applyFilters();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erreur lors de la récupération des étudiants:', error);
      this.isLoading = false;
    }
  });

  }

  applyFilters(): void {
    let filtered = [...this.teachers];

    // Filtre par niveau
    if (this.filters.grade) {
      filtered = filtered.filter(d => d.grade === this.filters.grade);
    }

    // Recherche par nom ou prénom
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }

    // Mettre à jour les résultats filtrés et la pagination
    this.filteredTeachers = filtered;
    this.totalPages = Math.ceil(this.filteredTeachers.length / this.itemsPerPage);
    this.currentPage = 1; // Retour à la première page après filtrage
  }

  resetFilters(): void {
    this.filters = {
      grade: '',
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

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  onAddTeacherClick() {
    this.showAddUserModal=true;
  }

  onUserAdded(user:User) {
    const teacher : Teacher =user as Teacher ;
    this.showAddUserModal = false;
    this.teachers.unshift(teacher);
    this.userService.setUsers([...this.teachers]);
    this.applyFilters();
  }

  protected readonly UserRole = UserRole;


  removeTeacher(teacherId: string) {
    this.teachers = this.teachers.filter(s => s.id !== teacherId);
    this.userService.setUsers([...this.teachers]);
    this.applyFilters();
  }
}
