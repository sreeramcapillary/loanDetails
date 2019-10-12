import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OlddatauploadRoutingModule } from './olddataupload-routing.module';
import { OlddatauploadComponent } from './olddataupload/olddataupload.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [OlddatauploadComponent],
  imports: [
    CommonModule,
    OlddatauploadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class OlddatauploadModule { }
