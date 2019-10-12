import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmploginRoutingModule } from './emplogin-routing.module';
import { CustomerloandetailsComponent } from './customerloandetails/customerloandetails.component';
import { ViewloandetailsComponent } from './viewloandetails/viewloandetails.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CustomerloandetailsComponent, ViewloandetailsComponent],
  imports: [
    CommonModule,
    EmploginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class EmploginModule { }
