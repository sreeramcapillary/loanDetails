import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignedLoansComponent } from './unassigned-loans.component';

describe('UnassignedLoansComponent', () => {
  let component: UnassignedLoansComponent;
  let fixture: ComponentFixture<UnassignedLoansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnassignedLoansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnassignedLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
