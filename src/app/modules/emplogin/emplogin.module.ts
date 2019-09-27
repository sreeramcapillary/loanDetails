import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmploginRoutingModule } from './emplogin-routing.module';
import { CustomerloandetailsComponent } from './customerloandetails/customerloandetails.component';
import { ViewloandetailsComponent } from './viewloandetails/viewloandetails.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileSelectDirective } from 'ng2-file-upload';

@NgModule({
  declarations: [CustomerloandetailsComponent, ViewloandetailsComponent,FileSelectDirective],
  imports: [
    CommonModule,
    EmploginRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class EmploginModule { }
