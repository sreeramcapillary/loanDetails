import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignLoanListComponent } from './assign-loan-list.component';

describe('AssignLoanListComponent', () => {
  let component: AssignLoanListComponent;
  let fixture: ComponentFixture<AssignLoanListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignLoanListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignLoanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
