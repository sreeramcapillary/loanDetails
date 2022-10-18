import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadregistationComponent } from './leadregistation/leadregistation.component';
import { LeadlistComponent } from './leadlist/leadlist.component';

const routes: Routes = [ 
 {
path: '',
component: LeadlistComponent
},{
  path: 'lead-list',
  component: LeadlistComponent
  },{
  path: 'lead-registation',
  component: LeadregistationComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadregistationRoutingModule { }
