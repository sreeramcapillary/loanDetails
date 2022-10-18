import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingleEmployeeDataUploadComponent } from './single-employee-data-upload/single-employee-data-upload.component';

const routes: Routes = [{
  path: '',
  component: SingleEmployeeDataUploadComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleEmployeeDataUploadRoutingModule { }
