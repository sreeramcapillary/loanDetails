import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DownloadloansRoutingModule } from './downloadloans-routing.module';
import { DownloadloansComponent } from './downloadloans/downloadloans.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [DownloadloansComponent],
  imports: [
    CommonModule,
    DownloadloansRoutingModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DownloadloansModule { }
