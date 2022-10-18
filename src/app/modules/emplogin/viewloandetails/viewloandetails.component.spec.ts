import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewloandetailsComponent } from './viewloandetails.component';

describe('ViewloandetailsComponent', () => {
  let component: ViewloandetailsComponent;
  let fixture: ComponentFixture<ViewloandetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewloandetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewloandetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
