import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleEmployeeDataUploadComponent } from './single-employee-data-upload.component';

describe('SingleEmployeeDataUploadComponent', () => {
  let component: SingleEmployeeDataUploadComponent;
  let fixture: ComponentFixture<SingleEmployeeDataUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleEmployeeDataUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleEmployeeDataUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
