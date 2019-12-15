import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnassignedLoansComponent } from './unassigned-loans/unassigned-loans.component';
import { UnassignedLoanListRoutingModule } from './unassigned-loans-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  declarations: [UnassignedLoansComponent],
  imports: [
    CommonModule,
    UnassignedLoanListRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgMultiSelectDropDownModule.forRoot(),
  ]
})
export class UnassignedLoansModule { }
