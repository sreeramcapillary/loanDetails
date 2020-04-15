import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepaymentdatauploadRoutingModule } from './repaymentdataupload-routing.module';
import { RepaymentdatauploadComponent } from './repaymentdataupload/repaymentdataupload.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [RepaymentdatauploadComponent],
  imports: [
    CommonModule,
    RepaymentdatauploadRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class RepaymentdatauploadModule { }
