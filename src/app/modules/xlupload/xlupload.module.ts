import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XluploadRoutingModule } from './xlupload-routing.module';
import { XluploadComponent } from './xlupload/xlupload.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [XluploadComponent],
  imports: [
    CommonModule,
    XluploadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class XluploadModule { }
