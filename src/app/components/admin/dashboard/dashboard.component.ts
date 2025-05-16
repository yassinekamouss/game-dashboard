import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database, onValue, ref, off } from '@angular/fire/database';
import { User } from '../../../models/user';
import { Student } from '../../../models/student';
import { UserRole } from '../../../models/user-role';
import { Teacher } from '../../../models/teacher';
import { LineChartComponent } from '../../charts/line-chart/line-chart.component';

interface GradeDistribution {
  grade: string;
  count: number;
}

interface Activity {
  type: 'login' | 'game' | 'achievement' | 'update';
  description: string;
  timestamp: Date;
}

interface DashboardStatistics {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  maleCount: number;
  femaleCount: number;
  totalGamesPlayed: number;
  gradeDistribution: GradeDistribution[];
  topStudents: any[];
  recentActivities: Activity[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  studentGrowthData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Nombre d\'élèves',
        data: [65, 72, 78, 75, 82, 90],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  private db: Database = inject(Database);
  users: User[] | null = null;
  private usersRef = ref(this.db, 'users');
  isLoading = true;
  currentDate = new Date();

  statistics: DashboardStatistics = {
    studentCount: 0,
    teacherCount: 0,
    parentCount: 0,
    maleCount: 0,
    femaleCount: 0,
    totalGamesPlayed: 0,
    gradeDistribution: [],
    topStudents: [],
    recentActivities: [],
  };

  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Écoute les changements sur /users
    onValue(this.usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.users = Object.values(data);
      } else {
        this.users = [];
      }
      this.isLoading = false;
    });
  }

  refreshData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.loadData();
    }, 1000); // Simulation d'un délai de chargement
  }

  ngOnDestroy(): void {
    // Important pour éviter les fuites mémoire
    off(this.usersRef);
  }
}
