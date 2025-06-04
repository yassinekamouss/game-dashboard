import { Injectable } from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {Test} from '../../models/test';
import {map} from 'rxjs/operators';
import {Database, get, push, ref, set} from '@angular/fire/database';
import {equalTo, orderByChild, query} from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private db:Database) { }

  private testsSubject = new BehaviorSubject<Test[]>([]);
  tests$ = this.testsSubject.asObservable();

  loadTestsForTeacher(teacherId: string) {
    this.getTestsByTeacher(teacherId)
      .subscribe(tests => this.testsSubject.next(tests));
  }


  getTestsByTeacher(teacherId: string ): Observable<Test[]> {
    const testsRef = query(
      ref(this.db, 'tests'),
      orderByChild('createdBy'),
      equalTo(teacherId)
    );

    return from(get(testsRef)).pipe(
      map(snapshot => {
        const tests: Test[] = [];
        snapshot.forEach(child => {
          tests.push({
            ...child.val() as Test
          });
        });
        return tests;
      })
    );
  }

  setTests(tests: Test[]) {
    this.testsSubject.next(tests);
  }

  createTest(testData: Test): Observable<void> {
  const testId = testData.id; // Utilise l'id fourni
  const testRef = ref(this.db, `tests/${testId}`);
  return from(set(testRef, testData));
  }
}
