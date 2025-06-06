import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Test } from '../../models/test';
import { map, catchError, tap } from 'rxjs/operators';
import { Database, get, push, ref, set, remove } from '@angular/fire/database';
import { equalTo, orderByChild, query } from 'firebase/database';
import { TestState } from '../../models/test-state';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private db: Database) { }

  private testsSubject = new BehaviorSubject<Test[]>([]);
  tests$ = this.testsSubject.asObservable();

  loadTestsForTeacher(teacherId: string) {
    this.getTestsByTeacher(teacherId)
      .subscribe(tests => this.testsSubject.next(tests));
  }

  getTestsByTeacher(teacherId: string): Observable<Test[]> {
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

  // Nouvelle fonction pour mettre à jour l'état d'un test
  updateTestState(testId: string, newState: TestState): Observable<void> {
    const testRef = ref(this.db, `tests/${testId}/state`);
    return from(set(testRef, newState)).pipe(
      tap(() => {
        const currentTests = this.testsSubject.value;
        const updatedTests = currentTests.map(test => {
          if (test.id === testId) {
            return { ...test, state: newState };
          }
          return test;
        });
        this.testsSubject.next(updatedTests);
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de l\'état du test', error);
        return of(undefined);
      })
    );
  }

  // Nouvelle fonction pour supprimer un test
  deleteTest(testId: string): Observable<void> {
    const testRef = ref(this.db, `tests/${testId}`);
    return from(remove(testRef)).pipe(
      tap(() => {
        // Mettre à jour la liste locale des tests en supprimant celui qui a été supprimé
        const currentTests = this.testsSubject.value;
        const updatedTests = currentTests.filter(test => test.id !== testId);
        this.testsSubject.next(updatedTests);
      }),
      catchError(error => {
        console.error('Erreur lors de la suppression du test', error);
        return of(undefined);
      })
    );
  }
}