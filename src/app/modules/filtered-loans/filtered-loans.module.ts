import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilteredLoansComponent } from './filtered-loans/filtered-loans.component';
import { FilteredLoanListRoutingModule } from './filtered-loans-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  declarations: [FilteredLoansComponent],
  imports: [
    CommonModule,
    FilteredLoanListRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgMultiSelectDropDownModule.forRoot(),
  ]
})
export class FilteredLoansModule { }
