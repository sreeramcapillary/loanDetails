import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpregistationComponent } from './empregistation.component';

describe('EmpregistationComponent', () => {
  let component: EmpregistationComponent;
  let fixture: ComponentFixture<EmpregistationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpregistationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpregistationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
