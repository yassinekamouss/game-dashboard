import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Student} from '../../../models/student';
import {Chart, registerables} from 'chart.js';
import {Subscription} from 'rxjs';
import {UserRole} from '../../../models/user-role';
import {GradeLevel} from '../../../models/grade-level';
import {ClassePerformanceService} from '../../../services/classe-performance/classe-performance.service';
import {AuthService} from '../../../services/auth/auth.service';
import {Teacher} from '../../../models/teacher';

// Register Chart.js components
Chart.register(...registerables);

interface ClassGroup {
  id: string;
  name: string;
  grade: string;
  studentIds: string[];
}

@Component({
  selector: 'app-classe-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classe-performance.component.html',
  styleUrls: ['./classe-performance.component.css'],
})
export class ClassePerformanceComponent implements OnInit, OnDestroy {
  // Properties
  Math = Math; // Make Math available in the template
  students: Student[] = [];
  filteredStudents: Student[] = [];
  displayedStudents: Student[] = [];
  isLoading: boolean = true;

  topPerformers: Student[] = [];

  // Admin grade navigation
  grades = Object.values(GradeLevel);
  selectedGrade: GradeLevel = GradeLevel.GRADE_1;
  // Filters and pagination
  selectedClassId: string = '';
  selectedClass: ClassGroup | null = null;
  selectedPeriod: string = 'month';
  studentSearch: string = '';

  sortBy: 'name' | 'score' | 'level' | 'activity' = 'score';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  // Modal properties
  showModal: boolean = false;
  selectedStudent: Student | null = null;
  levelProgressChart: Chart | null = null;

  // Subscriptions
  private subscriptions = new Subscription();

  constructor(
    private classePerformanceService: ClassePerformanceService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Initialiser le grade sélectionné selon le rôle
      if (user.role === UserRole.ADMIN) {
        this.selectedGrade = GradeLevel.GRADE_1; // Grade par défaut pour l'admin
      } else if (user.role === UserRole.TEACHER) {
        this.selectedGrade = (user as Teacher).grade;
      }
      this.loadStudents();
    } else if (this.authService.currentUser$) {
      const sub = this.authService.currentUser$.subscribe((user) => {
        if (user) {
          // Initialiser le grade sélectionné selon le rôle
          if (user.role === UserRole.ADMIN) {
            this.selectedGrade = GradeLevel.GRADE_1;
          } else if (user.role === UserRole.TEACHER) {
            this.selectedGrade = (user as Teacher).grade;
          }
          this.loadStudents();
        }
      });
      this.subscriptions.add(sub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.levelProgressChart) {
      this.levelProgressChart.destroy();
    }
  }

  applyStudentFilter(): void {
    // Si aucun étudiant, ne rien faire
    if (!this.students || this.students.length === 0) {
      this.filteredStudents = [];
      this.displayedStudents = [];
      return;
    }

    let filtered = [...this.students];

    // Apply search filter
    if (this.studentSearch && this.studentSearch.trim()) {
      const searchLower = this.studentSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (student) =>
          (student.firstName?.toLowerCase() || '').includes(searchLower) ||
          (student.lastName?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Apply sorting
    filtered = this.sortStudentsList(filtered);

    this.filteredStudents = filtered;
    this.updatePagination();
  }

  findTopPerformers(): void {
    if (!this.students || this.students.length === 0) {
      this.topPerformers = [];
      return;
    }

    // Sort by score and get top 6 - Use the full student list, not filtered
    this.topPerformers = [...this.students]
      .sort(
        (a, b) => (b.playerProfile?.score || 0) - (a.playerProfile?.score || 0)
      )
      .slice(0, 6);
  }

  loadStudents(): void {
    this.isLoading = true;

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      let gradeToUse: GradeLevel;

      if (currentUser.role === UserRole.ADMIN) {
        // Pour l'admin, utiliser le grade sélectionné
        gradeToUse = this.selectedGrade;
      } else if (currentUser.role === UserRole.TEACHER) {
        // Pour le teacher, utiliser son grade
        gradeToUse = (currentUser as Teacher).grade;
      } else {
        console.error('Current user is not a teacher or admin');
        this.students = [];
        this.filteredStudents = [];
        this.displayedStudents = [];
        this.topPerformers = [];
        this.isLoading = false;
        return;
      }

      const subscription = this.classePerformanceService
        .getStudentsByGrade(gradeToUse)
        .subscribe({
          next: (students) => {
            this.students = students || [];
            this.applyStudentFilter();
            this.findTopPerformers();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading students:', error);
            this.students = [];
            this.filteredStudents = [];
            this.displayedStudents = [];
            this.topPerformers = [];
            this.isLoading = false;
          },
        });

      this.subscriptions.add(subscription);
    } else {
      console.error('No current user found');
      this.students = [];
      this.filteredStudents = [];
      this.displayedStudents = [];
      this.topPerformers = [];
      this.isLoading = false;
    }
  }

  sortStudentsList(students: Student[]): Student[] {
    if (!students || students.length === 0) return [];

    return students.sort((a, b) => {
      let compareValue = 0;

      switch (this.sortBy) {
        case 'name':
          compareValue = (
            (a.lastName || '') + (a.firstName || '')
          ).localeCompare((b.lastName || '') + (b.firstName || ''));
          break;
        case 'score':
          compareValue =
            (a.playerProfile?.score || 0) - (b.playerProfile?.score || 0);
          break;
        case 'level':
          compareValue =
            (a.playerProfile?.mathLevel || 0) -
            (b.playerProfile?.mathLevel || 0);
          break;
        case 'activity':
          const aDate = this.getLastActivity(a).getTime();
          const bDate = this.getLastActivity(b).getTime();
          compareValue = aDate - bDate;
          break;
      }

      return this.sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }

  sortStudents(sortField: 'name' | 'score' | 'level'): void {
    if (this.sortBy === sortField) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortField;
      this.sortDirection = 'desc';
    }

    this.applyStudentFilter();
  }

  updatePagination(): void {
    if (!this.filteredStudents || this.filteredStudents.length === 0) {
      this.totalPages = 0;
      this.currentPage = 1;
      this.displayedStudents = [];
      return;
    }

    this.totalPages = Math.ceil(
      this.filteredStudents.length / this.itemsPerPage
    );
    this.totalPages = this.totalPages || 1; // Au moins une page même vide

    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedStudents = this.filteredStudents.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const totalVisible = 5;
    const pages: number[] = [];

    if (this.totalPages <= totalVisible) {
      // Show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with current page in the middle if possible
      const leftSide = Math.floor(totalVisible / 2);
      let start = Math.max(1, this.currentPage - leftSide);
      const end = Math.min(start + totalVisible - 1, this.totalPages);

      // Adjust start if we're near the end
      if (end - start + 1 < totalVisible) {
        start = Math.max(1, end - totalVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getLastActivity(student: Student): Date {
    if (
      !student ||
      !student.gameProgress ||
      student.gameProgress.length === 0
    ) {
      return new Date(0); // Return epoch if no activity
    }

    // Find the most recent gameplay
    try {
      const dates = student.gameProgress.map((progress) =>
        progress.completedAt ? new Date(progress.completedAt) : new Date(0)
      );
      return new Date(Math.max(...dates.map((date) => date.getTime())));
    } catch (error) {
      console.error('Error getting last activity:', error);
      return new Date(0);
    }
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadStudents();
  }

  // Admin grade navigation method
  onGradeChange(grade: GradeLevel): void {
    this.selectedGrade = grade;
    this.currentPage = 1; // Reset pagination
    this.loadStudents();
  }

// Helper method to check if current user is admin
  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.ADMIN;
  }
  // Modal methods
  openStudentModal(student: Student): void {
    this.selectedStudent = student;
    this.showModal = true;

    // Use setTimeout to ensure the DOM is ready after the modal is shown
    setTimeout(() => {
      this.renderLevelProgressChart();
    }, 100);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedStudent = null;
    if (this.levelProgressChart) {
      this.levelProgressChart.destroy();
      this.levelProgressChart = null;
    }
  }

  renderLevelProgressChart(): void {
    if (!this.selectedStudent?.historyMathLevel?.length) {
      return;
    }

    const chartElement = document.getElementById(
      'levelProgressChart'
    ) as HTMLCanvasElement;
    if (!chartElement) return;

    // Sort history by date
    try {
      const history = [...this.selectedStudent.historyMathLevel].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const labels = history.map((item) => {
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      });

      const data = history.map((item) => item.level);

      if (this.levelProgressChart) {
        this.levelProgressChart.destroy();
      }

      this.levelProgressChart = new Chart(chartElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Niveau de Math',
              data: data,
              fill: false,
              borderColor: '#4CAF50',
              tension: 0.1,
              pointBackgroundColor: '#4CAF50',
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Niveau',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Progression du Niveau de Mathématiques',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error rendering chart:', error);
    }
  }

  getGradeDisplayName(grade: GradeLevel): string {
    const gradeTranslations: { [key in GradeLevel]: string } = {
      [GradeLevel.GRADE_1]: '1ère année',
      [GradeLevel.GRADE_2]: '2ème année',
      [GradeLevel.GRADE_3]: '3ème année',
      [GradeLevel.GRADE_4]: '4ème année',
      [GradeLevel.GRADE_5]: '5ème année',
      [GradeLevel.GRADE_6]: '6ème année'
    };
    return gradeTranslations[grade];
  }

}
