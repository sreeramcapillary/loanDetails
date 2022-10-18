import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmploginRoutingModule } from './emplogin-routing.module';
import { CustomerloandetailsComponent } from './customerloandetails/customerloandetails.component';
import { ViewloandetailsComponent } from './viewloandetails/viewloandetails.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [CustomerloandetailsComponent, ViewloandetailsComponent],
  imports: [
    CommonModule,
    EmploginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ]
})
export class EmploginModule { }
