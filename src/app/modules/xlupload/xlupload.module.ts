import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { XluploadRoutingModule } from './xlupload-routing.module';
import { XluploadComponent } from './xlupload/xlupload.component';
import { FileSelectDirective } from 'ng2-file-upload';

@NgModule({
  declarations: [XluploadComponent,FileSelectDirective],
  imports: [
    CommonModule,
    XluploadRoutingModule
  ]
})
export class XluploadModule { }
