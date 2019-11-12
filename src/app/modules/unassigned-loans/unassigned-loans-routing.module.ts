import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnassignedLoansComponent } from './unassigned-loans/unassigned-loans.component';

const routes: Routes = [{
  path: '',
  component: UnassignedLoansComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnassignedLoanListRoutingModule { }
