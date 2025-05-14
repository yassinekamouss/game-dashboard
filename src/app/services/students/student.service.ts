import {Injectable} from '@angular/core';
import {Student} from '../../models/student';
import {from, Observable, throwError} from 'rxjs';
import {equalTo, orderByChild, query} from 'firebase/database';
import {Database, get, ref} from '@angular/fire/database';
import {catchError, map} from 'rxjs/operators';
import {GradeLevel} from '../../models/grade-level';
import {UserRole} from '../../models/user-role';

@Injectable({
   providedIn: 'root'
 })
 export class StudentService {


   constructor(private db:Database) {}
   getStudentsByGrade(grade:GradeLevel): Observable<Student[]> {
     const usersQuery = query(
       ref(this.db, 'users'),
       orderByChild('grade'),
       equalTo(grade.toLowerCase())
     )

     return from(get(usersQuery)).pipe(
       map(snapshot => {
         if (snapshot.exists()) {
           const students: Student[] = [];
           snapshot.forEach(childSnapshot => {
             const student = childSnapshot.val() as Student;
             if(student.role === UserRole.STUDENT)
             students.push(student);
           });
           return students;
         }
         return [];
       }),
       catchError(error => {
         console.error('Erreur lors de la récupération des utilisateurs:', error);
         return throwError(() => error);
       })
     );
   }
 }
