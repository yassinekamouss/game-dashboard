import { Injectable, inject } from '@angular/core';
import { Database, ref, get, query, orderByChild, startAt, endAt } from '@angular/fire/database';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { GradeLevel } from '../../models/grade-level';
import { UserRole } from '../../models/user-role';
import { Student } from '../../models/student';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private db: Database = inject(Database);

  constructor() { }

  /**
   * Récupère les données étudiants avec filtrage optionnel par grade
   * @param gradeFilter Grade spécifique à filtrer (optionnel)
   * @param teacherId ID du professeur (optionnel, pour filtrer les étudiants d'un prof)
   */
  async fetchStudents(gradeFilter?: GradeLevel, teacherId?: string): Promise<Student[]> {
    try {
      const studentsQuery = query(
        ref(this.db, 'users'),
        orderByChild('role'),
        startAt(UserRole.STUDENT),
        endAt(UserRole.STUDENT)
      );
      const snapshot = await get(studentsQuery);

      if (snapshot.exists()) {
        let students = Object.values(snapshot.val()).filter(
          (user: any) => user.role === UserRole.STUDENT
        ) as Student[];
        
        // Filtrer par grade si spécifié
        if (gradeFilter) {
          students = students.filter(student => student.grade === gradeFilter);
        }
        
        // Filtrer par teacherId si spécifié
        if (teacherId) {
          students = students.filter(student => student.teacherId === teacherId);
        }
        
        return students;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
      return [];
    }
  }

  /**
   * Génère les données pour le graphique de distribution des niveaux de mathématiques
   * @param students Liste des étudiants
   * @param gradeFilter Grade spécifique à filtrer (optionnel)
   */
  generateMathLevelChartData(students: Student[], gradeFilter?: GradeLevel): {
    labels: string[];
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  } {
    const mathLevelCounts: { [key: number]: number } = {};
    
    // Filtrer par grade si nécessaire
    const filteredStudents = gradeFilter 
      ? students.filter(student => student.grade === gradeFilter)
      : students;
      
    filteredStudents.forEach((student) => {
      if (student.playerProfile && typeof student.playerProfile.mathLevel === 'number') {
        const level = student.playerProfile.mathLevel;
        mathLevelCounts[level] = (mathLevelCounts[level] || 0) + 1;
      }
    });

    const levels = Object.keys(mathLevelCounts).map(Number).sort((a, b) => a - b);
    const counts = levels.map((level) => mathLevelCounts[level]);
    
    // Couleurs pour le graphique
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)'
    ];
    
    const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));
    
    console.log('counts', counts);

    return {
      labels: levels.map((level) => `Niveau ${level}`),
      data: counts,
      backgroundColor: backgroundColors,
      borderColor: borderColors
    };
  }

  /**
   * Génère les données pour le graphique de répartition des scores par grade
   * @param students Liste des étudiants
   * @param selectedGrade Grade spécifique à afficher (optionnel, sinon tous les grades)
   */
  generateScoreByGradeChartData(students: Student[], selectedGrade?: GradeLevel) {
    // Définir les plages de scores
    const ranges = [
      '0-10', '11-20', '21-30', '31-40', '41-50',
      '51-60', '61-70', '71-80', '81-90', '91-100',
    ];
    
    // Si un grade spécifique est sélectionné, ne traiter que ce grade
    if (selectedGrade) {
      const filteredStudents = students.filter(student => student.grade === selectedGrade);
      const scoreDistribution = this.calculateScoreDistribution(filteredStudents);
      
      return {
        labels: ranges,
        datasets: [{
          label: `${selectedGrade}`,
          data: scoreDistribution,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
    }
    
    // Sinon, traiter tous les grades
    const scoresByGrade: { [key in GradeLevel]?: number[] } = {};
    (Object.values(GradeLevel) as GradeLevel[]).forEach((grade) => {
      if (typeof grade === 'string') {
        scoresByGrade[grade] = [];
      }
    });

    students.forEach((student) => {
      if (
        student.grade &&
        scoresByGrade.hasOwnProperty(student.grade) &&
        student.playerProfile &&
        typeof student.playerProfile.score === 'number'
      ) {
        scoresByGrade[student.grade]?.push(student.playerProfile.score);
      }
    });

    const gradeColors: { [key in GradeLevel]?: string } = {
      [GradeLevel.GRADE_1]: 'rgba(255, 99, 132, 0.7)',
      [GradeLevel.GRADE_2]: 'rgba(54, 162, 235, 0.7)',
      [GradeLevel.GRADE_3]: 'rgba(255, 206, 86, 0.7)',
      [GradeLevel.GRADE_4]: 'rgba(75, 192, 192, 0.7)',
      [GradeLevel.GRADE_5]: 'rgba(153, 102, 255, 0.7)',
      [GradeLevel.GRADE_6]: 'rgba(255, 159, 64, 0.7)',
    };

    const datasets = (Object.entries(scoresByGrade) as [GradeLevel, number[]][])
      .filter(([_, scores]) => scores.length > 0)
      .map(([grade, scores]) => {
        return {
          label: `${grade}`,
          data: this.calculateScoreDistribution(scores),
          backgroundColor: gradeColors[grade] || 'rgba(128, 128, 128, 0.7)',
          borderColor: (gradeColors[grade] || 'rgba(128, 128, 128, 1)').replace('0.7', '1'),
          borderWidth: 1,
        };
      });

    return {
      labels: ranges,
      datasets: datasets
    };
  }

  /**
   * Calcule la distribution des scores pour un ensemble de scores
   * @param scores Liste des scores ou étudiants
   */
  private calculateScoreDistribution(scoresOrStudents: number[] | Student[]): number[] {
    const counts = new Array(10).fill(0); // 10 plages de scores
    
    let scores: number[] = [];
    
    // Déterminer si nous avons des scores ou des étudiants
    if (scoresOrStudents.length > 0) {
      if (typeof scoresOrStudents[0] === 'number') {
        scores = scoresOrStudents as number[];
      } else {
        // Extraire les scores des étudiants
        (scoresOrStudents as Student[]).forEach(student => {
          if (student.playerProfile && typeof student.playerProfile.score === 'number') {
            scores.push(student.playerProfile.score);
          }
        });
      }
    }

    // Calculer la distribution
    scores.forEach((score) => {
      if (score < 0) score = 0;
      if (score > 100) score = 100;
      
      let rangeIndex = 0;
      if (score === 0) rangeIndex = 0;
      else if (score > 0 && score <= 10) rangeIndex = 0;
      else rangeIndex = Math.floor((score - 1) / 10);
      
      counts[rangeIndex]++;
    });
    
    return counts;
  }

  /**
   * Génère la configuration pour un graphique en barres
   * @param title Titre du graphique
   * @param xLabel Label de l'axe X
   * @param yLabel Label de l'axe Y
   */
  getBarChartConfig(title: string, xLabel: string, yLabel: string): ChartConfiguration {
    return {
      type: 'bar' as ChartType,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: yLabel },
          },
          x: {
            title: { display: true, text: xLabel },
          },
        },
        plugins: {
          title: {
            display: true,
            text: title
          }
        }
      }
    };
  }
}