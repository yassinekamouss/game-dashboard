// import { Injectable } from '@angular/core';
// import { BehaviorSubject, map, Observable } from 'rxjs';
// import { UserService } from '../users/user.service';
// import { Student } from '../../models/student';

// @Injectable({
//   providedIn: 'root'
// })
// export class StudentService {

//    private filtersSubject = new BehaviorSubject<Filters>({
//     grade: '',
//     gender: '',
//     ageMin: null,
//     ageMax: null,
//     teacherId: '',
//     search: ''
//   });

//   filters$ = this.filtersSubject.asObservable();

//   constructor(private userService: UserService) {}

//   setFilters(filters: Filters) {
//     this.filtersSubject.next(filters);
//   }

//   getAllStudents(): Observable<Student[]> {
//     return this.userService.getUsersByRole('student') as Observable<Student[]>;
//   }

//   getStudentsByTeacher(teacherId: string): Observable<Student[]> {
//     return this.getAllStudents().pipe(
//       map(students => students.filter(s => s.teacherId === teacherId))
//     );
//   }
// }
