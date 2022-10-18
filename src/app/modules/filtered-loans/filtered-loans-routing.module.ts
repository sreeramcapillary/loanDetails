import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilteredLoansComponent } from './filtered-loans/filtered-loans.component';

const routes: Routes = [{
  path: '',
  component: FilteredLoansComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilteredLoanListRoutingModule { }
