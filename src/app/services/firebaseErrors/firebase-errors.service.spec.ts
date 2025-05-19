import { TestBed } from '@angular/core/testing';

import { FirebaseErrorsService } from './firebase-errors.service';

describe('FirebaseErrorsService', () => {
  let service: FirebaseErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
