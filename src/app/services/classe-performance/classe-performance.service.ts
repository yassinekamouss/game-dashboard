import { Injectable } from '@angular/core';
import { Database, ref, get, query, orderByChild, equalTo } from '@angular/fire/database';
import { Observable, from, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Student } from '../../models/student';
import { GradeLevel } from '../../models/grade-level';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../models/user-role';

@Injectable({
  providedIn: 'root'
})
export class ClassePerformanceService {

  constructor(
    private db: Database,
    private authService: AuthService
  ) { }

  /**
   * Récupère tous les étudiants pour un grade spécifique
   * @param grade Le niveau scolaire des étudiants à récupérer
   * @returns Liste observable des étudiants
   */
  getStudentsByGrade(grade: GradeLevel): Observable<Student[]> {
    console.log(`Fetching students for grade: ${grade}`);
    
    const studentsRef = ref(this.db, 'users');
    const studentsQuery = query(
      studentsRef, 
      orderByChild('grade'), 
      equalTo(grade)
    );

    return from(get(studentsQuery)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const students: Student[] = [];
          snapshot.forEach((childSnapshot) => {
            const student = childSnapshot.val() as Student;
            if (student.role === UserRole.STUDENT) {
              students.push(student);
            }
          });
          console.log(`Found ${students.length} students for grade ${grade}`);
          return students;
        }
        console.log(`No students found for grade ${grade}`);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching students by grade:', error);
        return of([]);
      })
    );
  }

}