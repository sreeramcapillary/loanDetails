import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadregistationComponent } from './leadregistation.component';

describe('LeadregistationComponent', () => {
  let component: LeadregistationComponent;
  let fixture: ComponentFixture<LeadregistationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadregistationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadregistationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
