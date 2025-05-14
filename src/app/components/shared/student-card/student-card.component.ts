import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { Student } from '../../../models/student';

@Component({
  selector: 'app-student-card',
  imports: [CommonModule],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.css',
  standalone: true,
})
export class StudentCardComponent {
  @Input() student: Student | null = null;


  calculateProgress(student: Student): number {
    // Simuler un calcul de progression basé sur les jeux complétés
    if (!student.gameProgress || student.gameProgress.length === 0) {
      return 0;
    }
    
    const completedGames = student.gameProgress.filter(game => game.completedAt).length;
    return Math.round((completedGames / student.gameProgress.length) * 100);
  }

  getLimitedAchievements(student: Student): string[] {
    return student.achievements ? student.achievements.slice(0, 4) : [];
  }
  
  getBadgeClass(index: number): string {
    const classes = ['gold', 'silver', 'bronze'];
    return classes[index] || '';
  }
}
