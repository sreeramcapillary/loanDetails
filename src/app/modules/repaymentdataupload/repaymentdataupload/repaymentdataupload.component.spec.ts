import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepaymentdatauploadComponent } from './repaymentdataupload.component';

describe('RepaymentdatauploadComponent', () => {
  let component: RepaymentdatauploadComponent;
  let fixture: ComponentFixture<RepaymentdatauploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepaymentdatauploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepaymentdatauploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
