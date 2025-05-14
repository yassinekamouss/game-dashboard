import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/users/user.service';
import { Student } from '../../../models/student';
import { User } from '../../../models/user';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  teachers: User[] = [];
  isLoading = true;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  
  // Filtres
  filters = {
    grade: '',
    gender: '',
    ageMin: null as number | null,
    ageMax: null as number | null,
    teacherId: '',
    search: ''
  };
  
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.isLoading = true;
    
    // Charger les élèves
    this.userService.getUsersByRole('student').subscribe({
      next: (users: User[]) => {
        this.students = users as Student[];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des étudiants:', error);
        this.isLoading = false;
      }
    });
    
    // Charger les enseignants pour le filtre
    this.userService.getUsersByRole('teacher').subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des enseignants:', error);
      }
    });
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
    
    // Filtre par âge minimum
    if (this.filters.ageMin !== null) {
      filtered = filtered.filter(s => this.calculateAge(s.dateOfBirth) >= this.filters.ageMin!);
    }
    
    // Filtre par âge maximum
    if (this.filters.ageMax !== null) {
      filtered = filtered.filter(s => this.calculateAge(s.dateOfBirth) <= this.filters.ageMax!);
    }
    
    // Filtre par enseignant
    if (this.filters.teacherId) {
      filtered = filtered.filter(s => s.teacherId === this.filters.teacherId);
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
      ageMin: null,
      ageMax: null,
      teacherId: '',
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
  
  // Méthodes utilitaires
  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  calculateProgress(student: Student): number {
    // Simuler un calcul de progression basé sur les jeux complétés
    if (!student.gameProgress || student.gameProgress.length === 0) {
      return 0;
    }
    
    // Exemple simple: nombre de jeux terminés / nombre total de jeux * 100
    const completedGames = student.gameProgress.filter(game => game.completedAt).length;
    return Math.round((completedGames / student.gameProgress.length) * 100);
  }
  
  getLimitedAchievements(student: Student): string[] {
    return student.achievements ? student.achievements.slice(0, 3) : [];
  }
  
  getBadgeClass(index: number): string {
    const classes = ['gold', 'silver', 'bronze'];
    return classes[index] || '';
  }
}
 