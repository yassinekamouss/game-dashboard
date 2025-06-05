import {Injectable} from '@angular/core';
import {Student} from '../../models/student';
import {BehaviorSubject, forkJoin, from, Observable, of, Subject, throwError} from 'rxjs';
import {equalTo, orderByChild, query} from 'firebase/database';
import {Database, get, ref, update} from '@angular/fire/database';
import {catchError, map} from 'rxjs/operators';
import {GradeLevel} from '../../models/grade-level';
import {UserRole} from '../../models/user-role';
import {UserService} from '../users/user.service';
import {QRCodeService} from '../qrcode/qrcode.service';

@Injectable({
   providedIn: 'root'
 })
 export class StudentService {

  private studentSubject = new Subject<Student[]>();
  students$ = this.studentSubject.asObservable();
   constructor(private db:Database ,
               private  userService :UserService,
               private qrCodeService:QRCodeService
   ) {}

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



  getStudentsWithoutParent(): Observable<Student[]> {
    return this.userService.getUsersByRole(UserRole.STUDENT).pipe(
      map(students => (students as Student[]).filter(s => !s.parentId || s.parentId === '') as Student[])
    );
  }

  updateParentIdForStudents(parentId: string, studentIds: string[]): Observable<null | void> {
    if (!parentId || studentIds.length === 0) {
      return of(void 0);
    }

    const updateCalls = studentIds.map(studentId => {
      const studentRef = ref(this.db, `users/${studentId}`);
      return from(update(studentRef, { parentId }));
    });

    return forkJoin(updateCalls).pipe(
      // forkJoin renvoie un tableau de résultats, on mappe vers void
      map(() => void 0)
    );
  }

  loadStudents(grade: GradeLevel): void {
    this.getStudentsByGrade(grade).subscribe(users => {
      this.studentSubject.next(users);
    });
  }

  setStudents(students : Student[]){
    this.studentSubject.next(students);
  }

  generateAndDownloadQRCode(studentId: string): Observable<boolean> {
    return this.userService.getUserById(studentId).pipe(
      map(user  => {
        const student = user as Student;
        this.qrCodeService.downloadStudentPDF(student).subscribe();
        return true;
      })
    );
  }

}
