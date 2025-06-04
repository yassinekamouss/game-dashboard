import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../../services/users/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Test } from '../../../models/test';
import { TestService } from '../../../services/tests/test.service';
import { Teacher } from '../../../models/teacher';
import { Subscription, delay, filter, switchMap, tap } from 'rxjs';
import {FormsModule} from '@angular/forms';
import {TestCardComponent} from '../../shared/test-card/test-card.component';
import {AddTestComponent} from './add-test/add-test.component';
import {GradeLevel} from '../../../models/grade-level';
import {CommonModule, NgIf} from '@angular/common';

@Component({
  selector: 'app-tests',
  standalone: true,
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.css',
  imports: [
    FormsModule, TestCardComponent, AddTestComponent, CommonModule
  ]
})
export class TestsComponent implements OnInit, OnDestroy {
  teacher!: Teacher;
  tests: Test[] = [];
  filteredTests: Test[] = [];
  isLoading = true;
  showAddTestModal = false;
  grade!: GradeLevel;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  initialLoaded = false;

  // Filtres
  filters = {
    search: ''
  };

  private testSub!: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
     this.isLoading = true;
    this.authService.currentUser$
      .pipe(
        filter(user => !!user),
        tap(user => {
          this.teacher = user as Teacher;
          this.grade = this.teacher.grade;
        }),
        tap(user => this.testService.loadTestsForTeacher(user!.id))
      )
      .subscribe();

    this.testSub = this.testService.tests$
     .pipe(delay(1300)) 
      .subscribe(tests => {
        this.tests = tests;
        this.applyFilters();
  
        setTimeout(() => {
          this.initialLoaded = true;
          this.isLoading = false; 
        }  , 950); 
      });
  }
  

  ngOnDestroy(): void {
    if (this.testSub) this.testSub.unsubscribe();
  }

applyFilters(resetPage = false): void {
  let filtered = [...this.tests];

  // Recherche par titre
  if (this.filters.search) {
    const search = this.filters.search.toLowerCase();
    filtered = filtered.filter(test =>
      test.title.toLowerCase().includes(search)
    );
  }

  this.filteredTests = filtered;
  this.totalPages = Math.ceil(this.filteredTests.length / this.itemsPerPage);
  if (resetPage) {
    this.currentPage = 1;
  }
}

  resetFilters(): void {
    this.filters = {
      search: ''
    };
    this.applyFilters(true);
  }

  // Pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onAddTest() {
    this.showAddTestModal = true;

  }

  onTestAdded(testCreated:Test) {
      this.showAddTestModal = false;
      const test = testCreated ;
      this.tests.push(test);
      this.testService.setTests([...this.tests]);
  }
}
