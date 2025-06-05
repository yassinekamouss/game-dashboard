import { CommonModule } from '@angular/common';
import { Component, Input, input, OnInit } from '@angular/core';
import { Student } from '../../../models/student';
import { ref } from 'firebase/database';
import { Database, onValue } from '@angular/fire/database';
import {QRCodeService} from '../../../services/qrcode/qrcode.service';
import {ModifyStudentComponent} from '../modify-student/modify-student.component';

@Component({
  selector: 'app-student-card',
  imports: [CommonModule , ModifyStudentComponent],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.css',
  standalone: true,
})
export class StudentCardComponent implements OnInit {
  @Input() student: Student | null = null;
  isGeneratingQR: boolean = false;
  showModifiyModalStudent = false;
  studentToModify :Student | null = null;

  constructor(private db: Database, private qrCodeService: QRCodeService) {}

  ngOnInit(): void {
    onValue(ref(this.db, `users/${this.student?.id}`), (snapshot) => {
      this.student = snapshot.val();
    });
  }
  calculateProgress(student: Student): number {
    // Simuler un calcul de progression basé sur les jeux complétés
    if (!student.gameProgress || student.gameProgress.length === 0) {
      return 0;
    }

    const completedGames = student.gameProgress.filter(
      (game) => game.completedAt
    ).length;
    return Math.round((completedGames / student.gameProgress.length) * 100);
  }

  getLimitedAchievements(student: Student): string[] {
    return student.achievements ? student.achievements.slice(0, 4) : [];
  }

  getBadgeClass(index: number): string {
    const classes = ['gold', 'silver', 'bronze'];
    return classes[index] || '';
  }


  downloadStudentQRCode(): void {
    this.isGeneratingQR = true;

    this.qrCodeService.downloadStudentPDF(this.student as Student).subscribe({
      next: () => {
        this.isGeneratingQR = false;
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du PDF:', err);
        this.isGeneratingQR = false;
      }
    });
  }

  editStudentClick(student :Student): void {
    this.studentToModify = student;
    this.showModifiyModalStudent = true;


  }

  onStudentModified($event: any) {
    this.showModifiyModalStudent = false;
}

}
