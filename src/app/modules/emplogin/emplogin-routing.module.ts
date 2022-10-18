import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerloandetailsComponent } from './customerloandetails/customerloandetails.component';
import { ViewloandetailsComponent } from './viewloandetails/viewloandetails.component';

const routes: Routes = [ {
  path: '',
  component: CustomerloandetailsComponent
  },{
    path: 'cutomerloandetails',
    component: CustomerloandetailsComponent
    },{
    path: 'viewdetails',
    component: ViewloandetailsComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmploginRoutingModule { }
