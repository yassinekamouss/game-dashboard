import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-role';
import { StudentService } from '../../../services/students/student.service'
import { GradeLevel } from '../../../models/grade-level';
import {Teacher} from '../../../models/teacher';
import {Student} from '../../../models/student';

@Component({
  selector: 'app-rapports',
  imports: [CommonModule, FormsModule],
  templateUrl: './rapports.component.html',
  styleUrl: './rapports.component.css',
  standalone: true
})
export class RapportsComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  students! : Student[];
  currentUser: User | null = null;
  selectedGrade: GradeLevel = GradeLevel.GRADE_1;
  grades = [GradeLevel.GRADE_1, GradeLevel.GRADE_2, GradeLevel.GRADE_3, GradeLevel.GRADE_4, GradeLevel.GRADE_5, GradeLevel.GRADE_6];
  reportData: any[] = [];
  loading: boolean = false;
  clicked: boolean = false;
  teacher! : Teacher;

  constructor(
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.isTeacher()) {
        this.teacher = user as Teacher;
        this.selectedGrade = this.teacher.grade;
      }
    });
  }

  isAdmin() {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  isTeacher() {
    return this.currentUser?.role === UserRole.TEACHER;
  }

  async generateReport() {
    this.clicked = true;
    this.loading = true;
    this.reportData = [];
    try {

      const grade = this.selectedGrade;
      // Récupération des élèves du grade sélectionné
      this.studentService.getStudentsByGrade(grade).subscribe(students=>{
        this.students = students;
      });
      // Si vous voulez filtrer par date, faites-le ici (exemple sur historyMathLevel)
      let filtered = this.students || [];
      if (this.startDate && this.endDate && this.students) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        filtered = this.students.filter(s => {
          // Exemple : on prend le dernier niveau de math dans la période
          if (!s.historyMathLevel) return false;
          return s.historyMathLevel.some(h =>
            new Date(h.date) >= start && new Date(h.date) <= end
          );
        }).map(s => {
          // On extrait le niveau de math et score dans la période
          const mathHistory = s.historyMathLevel?.filter(h =>
            new Date(h.date) >= start && new Date(h.date) <= end
          );
          const lastMath = mathHistory && mathHistory.length > 0 ? mathHistory[mathHistory.length - 1] : null;
          return {
            ...s,
            mathLevel: lastMath ? lastMath.level : '',
            score: s.playerProfile?.score ?? ''
          };
        });
      } else {
        filtered = (this.students ?? []).map(s => ({
          ...s,
          mathLevel: s.historyMathLevel?.length ? s.historyMathLevel[s.historyMathLevel.length - 1].level : '',
          score: s.playerProfile?.score ?? ''
        }));
      }
      this.reportData = filtered ?? [];
    } catch (e) {
      this.reportData = [];
    }
    this.loading = false;
  }

  downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Nom,Grade,Niveau de Math,Score\n";
    this.reportData.forEach(s => {
      csvContent += `${s.firstName } ${s.lastName},${s.grade},${s.mathLevel},${s.score}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rapport_eleves.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
