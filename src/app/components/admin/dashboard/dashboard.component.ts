import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Database, ref, get, off } from '@angular/fire/database';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-role';
import { Student } from '../../../models/student';
import { GradeLevel } from '../../../models/grade-level';
import Chart from 'chart.js/auto';
import { ChartService } from '../../../services/charts/chart.service';

interface DashboardStatistics {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  totalGamesPlayed: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('mathLevelChart') mathLevelChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('scoreByGradeChart') scoreByGradeChartCanvas!: ElementRef<HTMLCanvasElement>;

  private mathLevelChart: Chart | undefined;
  private scoreByGradeChart: Chart | undefined;

  private db: Database = inject(Database);
  private chartService = inject(ChartService);
  
  users: User[] | null = null;
  private usersRef = ref(this.db, 'users');
  private gamesRef = ref(this.db, 'tests');
  isLoading = true;
  currentDate = new Date();

  private studentDataForCharts: Student[] = [];
  
  // Pour le filtrage dans l'interface admin
  selectedGradeForMathLevel: GradeLevel | null = null;
  selectedGradeForScores: GradeLevel | null = null;
  
  // Liste des grades pour le select
  gradeOptions = Object.values(GradeLevel);

  statistics: DashboardStatistics = {
    studentCount: 0,
    teacherCount: 0,
    parentCount: 0,
    totalGamesPlayed: 0,
  };

  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.resetStatistics();
    this.studentDataForCharts = [];

    Promise.all([
      this.fetchUsers(),
      this.fetchGames(),
      this.fetchStudentsForCharts(),
    ])
      .then(() => {
        this.isLoading = false;
        this.initializeCharts();
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.isLoading = false;
      });
  }

  private async fetchUsers(): Promise<void> {
    try {
      const snapshot = await get(this.usersRef);
      if (snapshot.exists()) {
        this.users = Object.values(snapshot.val());
        this.calculateUserStatistics();
      } else {
        this.users = [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      this.users = [];
    }
  }

  private async fetchGames(): Promise<void> {
    try {
      const snapshot = await get(this.gamesRef);
      if (snapshot.exists()) {
        const gamesData = snapshot.val();
        this.statistics.totalGamesPlayed = Object.keys(gamesData).length;
      } else {
        this.statistics.totalGamesPlayed = 0;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux:', error);
      this.statistics.totalGamesPlayed = 0;
    }
  }

  private async fetchStudentsForCharts(): Promise<void> {
    this.studentDataForCharts = await this.chartService.fetchStudents();
  }

  private initializeCharts(): void {
    setTimeout(() => {
      this.initializeMathLevelChart();
      this.initializeScoreByGradeChart();
    }, 0);
  }

  private initializeMathLevelChart(): void {
    if (!this.mathLevelChartCanvas?.nativeElement) {
      console.warn('Canvas pour math level chart non disponible');
      return;
    }
    
    if (this.mathLevelChart) {
      this.mathLevelChart.destroy();
    }
    
    const chartData = this.chartService.generateMathLevelChartData(
      this.studentDataForCharts,
      this.selectedGradeForMathLevel || undefined
    );
    
    const config = this.chartService.getBarChartConfig(
      'Distribution des niveaux de mathématiques',
      'Niveau de mathématiques',
      "Nombre d'étudiants"
    );
    
    this.mathLevelChart = new Chart(this.mathLevelChartCanvas.nativeElement, {
      ...config,
      data: {
        labels: chartData.labels,
        datasets: [{
          label: "Nombre d'étudiants",
          data: chartData.data,
          backgroundColor: chartData.backgroundColor,
          borderColor: chartData.borderColor,
          borderWidth: 1
        }]
      }
    });
  }

  private initializeScoreByGradeChart(): void {
    if (!this.scoreByGradeChartCanvas?.nativeElement) {
      console.warn('Canvas pour score by grade chart non disponible');
      return;
    }
    
    if (this.scoreByGradeChart) {
      this.scoreByGradeChart.destroy();
    }
    
    const chartData = this.chartService.generateScoreByGradeChartData(
      this.studentDataForCharts,
      this.selectedGradeForScores || undefined
    );
    
    const config = this.chartService.getBarChartConfig(
      'Répartition des scores par niveau scolaire',
      'Plage de scores',
      "Nombre d'étudiants"
    );
    
    this.scoreByGradeChart = new Chart(this.scoreByGradeChartCanvas.nativeElement, {
      ...config,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      }
    });
  }

  onGradeFilterChange(): void {
    // Mettre à jour les graphiques lorsque les filtres changent
    this.initializeMathLevelChart();
    this.initializeScoreByGradeChart();
  }

  private resetStatistics(): void {
    this.statistics = {
      studentCount: 0,
      teacherCount: 0,
      parentCount: 0,
      totalGamesPlayed: 0,
    };
  }

  private calculateUserStatistics(): void {
    if (!this.users) return;
    this.resetStatistics();

    this.users.forEach((user) => {
      if (user.role === UserRole.STUDENT) this.statistics.studentCount++;
      else if (user.role === UserRole.TEACHER) this.statistics.teacherCount++;
      else if (user.role === UserRole.PARENT) this.statistics.parentCount++;
    });
  }

  refreshData(): void {
    this.destroyCharts();
    this.loadData();
  }

  private destroyCharts(): void {
    if (this.mathLevelChart) {
      this.mathLevelChart.destroy();
      this.mathLevelChart = undefined;
    }
    if (this.scoreByGradeChart) {
      this.scoreByGradeChart.destroy();
      this.scoreByGradeChart = undefined;
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}