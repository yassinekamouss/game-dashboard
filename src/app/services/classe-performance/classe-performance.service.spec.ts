import { TestBed } from '@angular/core/testing';

import { ClassePerformanceService } from './classe-performance.service';

describe('ClassePerformanceService', () => {
  let service: ClassePerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassePerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
