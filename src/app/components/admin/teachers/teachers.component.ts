import { Component } from '@angular/core';
import { Student } from '../../../models/student';
import { Teacher } from '../../../models/teacher';
import { UserService } from '../../../services/users/user.service';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherCardComponent } from '../../shared/teacher-card/teacher-card.component';

@Component({
  selector: 'app-teachers',
  imports: [CommonModule, FormsModule, TeacherCardComponent],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css',
  standalone: true,
})
export class TeachersComponent {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  isLoading = true;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  
  // Filtres
  filters = {
    grade: '',
    search: ''
  };
  
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.isLoading = true;
    
    // Charger les élèves
    this.userService.getUsersByRole('teacher').subscribe({
      next: (users: User[]) => {
        this.teachers = users as Teacher[];
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
}
