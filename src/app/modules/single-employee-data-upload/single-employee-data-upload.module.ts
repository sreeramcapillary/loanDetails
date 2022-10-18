import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SingleEmployeeDataUploadComponent } from './single-employee-data-upload/single-employee-data-upload.component';
import { SingleEmployeeDataUploadRoutingModule } from './single-employee-data-upload-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SingleEmployeeDataUploadComponent],
  imports: [
    CommonModule,
    SingleEmployeeDataUploadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class SingleEmployeeDataUploadModule { }
