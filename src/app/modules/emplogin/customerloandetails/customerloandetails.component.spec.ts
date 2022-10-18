import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerloandetailsComponent } from './customerloandetails.component';

describe('CustomerloandetailsComponent', () => {
  let component: CustomerloandetailsComponent;
  let fixture: ComponentFixture<CustomerloandetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerloandetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerloandetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
