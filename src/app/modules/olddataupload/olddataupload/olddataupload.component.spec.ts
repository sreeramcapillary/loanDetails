import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OlddatauploadComponent } from './olddataupload.component';

describe('OlddatauploadComponent', () => {
  let component: OlddatauploadComponent;
  let fixture: ComponentFixture<OlddatauploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OlddatauploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OlddatauploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
