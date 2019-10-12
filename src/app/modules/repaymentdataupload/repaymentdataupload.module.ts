import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepaymentdatauploadRoutingModule } from './repaymentdataupload-routing.module';
import { RepaymentdatauploadComponent } from './repaymentdataupload/repaymentdataupload.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [RepaymentdatauploadComponent],
  imports: [
    CommonModule,
    RepaymentdatauploadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class RepaymentdatauploadModule { }
