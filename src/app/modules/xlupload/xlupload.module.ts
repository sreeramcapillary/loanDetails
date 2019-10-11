import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XluploadRoutingModule } from './xlupload-routing.module';
import { XluploadComponent } from './xlupload/xlupload.component';
import { FileSelectDirective } from 'ng2-file-upload';

@NgModule({
  declarations: [XluploadComponent,FileSelectDirective],
  imports: [
    CommonModule,
    XluploadRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class XluploadModule { }
