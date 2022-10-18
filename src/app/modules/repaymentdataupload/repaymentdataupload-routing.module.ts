import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepaymentdatauploadComponent } from './repaymentdataupload/repaymentdataupload.component';

const routes: Routes = [{
  path: '',
  component: RepaymentdatauploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepaymentdatauploadRoutingModule { }
