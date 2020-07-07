import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadloansComponent } from './downloadloans.component';

describe('DownloadloansComponent', () => {
  let component: DownloadloansComponent;
  let fixture: ComponentFixture<DownloadloansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadloansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadloansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
