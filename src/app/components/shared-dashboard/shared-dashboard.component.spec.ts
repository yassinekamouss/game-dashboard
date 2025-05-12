import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedDashboardComponent } from './shared-dashboard.component';

describe('SharedDashboardComponent', () => {
  let component: SharedDashboardComponent;
  let fixture: ComponentFixture<SharedDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
