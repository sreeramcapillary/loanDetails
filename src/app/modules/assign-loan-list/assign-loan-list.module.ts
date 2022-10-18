import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignLoanListRoutingModule } from './assign-loan-list-routing.module';
import { AssignLoanListComponent } from './assign-loan-list/assign-loan-list.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [AssignLoanListComponent],
  imports: [
    CommonModule,
    AssignLoanListRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AssignLoanListModule { }
