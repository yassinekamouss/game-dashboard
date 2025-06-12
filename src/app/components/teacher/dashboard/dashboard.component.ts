import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Student } from '../../../models/student';
import { GradeLevel } from '../../../models/grade-level';
import { ChartService } from '../../../services/charts/chart.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Teacher } from '../../../models/teacher';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('mathLevelChart') mathLevelChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('scoreByGradeChart') scoreByGradeChartCanvas!: ElementRef<HTMLCanvasElement>;

  private mathLevelChart: Chart | undefined;
  private scoreByGradeChart: Chart | undefined;

  private chartService = inject(ChartService);
  
  isLoading = true;
  currentDate = new Date();
  students: Student[] = [];

  teacherId: string = ''; // ID du professeur connecté
  
  // Dans un cas réel, vous récupéreriez ces informations de l'utilisateur connecté
  currentUser : Teacher | null = null; // L'utilisateur connecté
  teacherGrade: GradeLevel = GradeLevel.GRADE_1; // Grade enseigné par le professeur
  
  totalStudents: number = 0;
  averageScore: number = 0;
  highestScore: number = 0;
  
  constructor(private authService : AuthService) {}

  ngOnInit(): void {
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user as Teacher;

      console.log('Utilisateur connecté:', this.currentUser);

      this.teacherGrade = this.currentUser?.grade ;
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;

    // Dans un cas réel, vous récupéreriez d'abord les infos du professeur connecté
    this.fetchTeacherStudents()
      .then(() => {
        this.isLoading = false;
        this.calculateStatistics();
        this.initializeCharts();
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.isLoading = false;
      });
  }

  private async fetchTeacherStudents(): Promise<void> {
    // Récupérer seulement les étudiants du professeur
    this.students = await this.chartService.fetchStudents(this.teacherGrade);
  }

  private calculateStatistics(): void {
    this.totalStudents = this.students.length;
    
    if (this.totalStudents > 0) {
      let totalScore = 0;
      this.highestScore = 0;
      
      this.students.forEach(student => {
        if (student.playerProfile && typeof student.playerProfile.score === 'number') {
          const score = student.playerProfile.score;
          totalScore += score;
          if (score > this.highestScore) {
            this.highestScore = score;
          }
        }
      });
      
      this.averageScore = Math.round(totalScore / this.totalStudents);
    } else {
      this.averageScore = 0;
      this.highestScore = 0;
    }
  }

  private initializeCharts(): void {
    setTimeout(() => {
      this.initializeMathLevelChart();
      this.initializeScoreChart();
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
      this.students,
      this.teacherGrade
    );
    
    const config = this.chartService.getBarChartConfig(
      `Distribution des niveaux de mathématiques (${this.teacherGrade})`,
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

  private initializeScoreChart(): void {
    if (!this.scoreByGradeChartCanvas?.nativeElement) {
      console.warn('Canvas pour score chart non disponible');
      return;
    }
    
    if (this.scoreByGradeChart) {
      this.scoreByGradeChart.destroy();
    }
    
    const chartData = this.chartService.generateScoreByGradeChartData(
      this.students,
      this.teacherGrade
    );
    
    const config = this.chartService.getBarChartConfig(
      `Répartition des scores (${this.teacherGrade})`,
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