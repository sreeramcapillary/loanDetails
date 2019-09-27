import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XluploadComponent } from './xlupload.component';

describe('XluploadComponent', () => {
  let component: XluploadComponent;
  let fixture: ComponentFixture<XluploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XluploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XluploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
