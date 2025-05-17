import { Injectable } from '@angular/core';
import {forkJoin, from, Observable, of, Subject, throwError} from 'rxjs';
import {ParentWithChildren} from '../../models/parentWithChildreen';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {User} from '../../models/user';
import {Student} from '../../models/student';
import {UserService} from '../users/user.service';

@Injectable({
  providedIn: 'root'
})
export class ParentService {


  parentSubject = new Subject<ParentWithChildren[]>();
  parent$ = this.parentSubject.asObservable();

  constructor(private userService :UserService) { }

  getParentWithChildren(): Observable<ParentWithChildren []> {
    return this.userService.getUsersByRole('parent').pipe(
      switchMap((users: User[]) => {
        const parents = users as ParentWithChildren[];
        if (parents.length === 0) return of([]);

        const parentRequests = parents.map((parent) => {
          const childIds = parent.children as unknown as string[];
          const childObservables = childIds.map((childId) =>
            this.userService.getUserById(childId)
          );

          return forkJoin(childObservables).pipe(
            map((students) => {
              parent.children = students.filter(
                (s): s is Student => s !== null
              );
              return parent;
            })
          );
        });

        return forkJoin(parentRequests).pipe(
          tap((parentsWithChildren) => {
            console.log('Parents avec leurs enfants :', parentsWithChildren);
          })
        );
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des parents:', error);
        return throwError(() => error);
      })
    );
  }

  setParents(parentsWithChildren :ParentWithChildren[]){
    this.parentSubject.next(parentsWithChildren);
  }

  loadParents(){
    this.getParentWithChildren().subscribe(parents=>{
      this.parentSubject.next(parents);
    })
  }

  getParentWithChildrenFromUser(user: User): Observable<ParentWithChildren> {
    const parent = user as ParentWithChildren;
    const childIds = parent.children as unknown as string[];

    const childObservables = childIds.map((id) =>
      this.userService.getUserById(id)
    );

    return forkJoin(childObservables).pipe(
      map((children) => {
        parent.children = children as Student[];
        return parent;
      })
    );
  }



}
