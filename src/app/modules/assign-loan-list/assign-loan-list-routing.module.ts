import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssignLoanListComponent } from './assign-loan-list/assign-loan-list.component';

const routes: Routes = [{
  path: '',
  component: AssignLoanListComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignLoanListRoutingModule { }
