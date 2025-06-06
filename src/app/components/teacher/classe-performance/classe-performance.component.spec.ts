import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassePerformanceComponent } from './classe-performance.component';

describe('ClassePerformanceComponent', () => {
  let component: ClassePerformanceComponent;
  let fixture: ComponentFixture<ClassePerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassePerformanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
