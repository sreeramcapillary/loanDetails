import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmpregistationComponent } from './empregistation/empregistation.component';
import { EmplistComponent } from './emplist/emplist.component';

const routes: Routes = [ 
 {
path: '',
component: EmplistComponent
},{
  path: 'emp-list',
  component: EmplistComponent
  },{
  path: 'emp-registation',
  component: EmpregistationComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpregistationRoutingModule { }
