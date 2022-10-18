import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeadregistationRoutingModule } from './leadregistation-routing.module';
import { LeadregistationComponent } from './leadregistation/leadregistation.component';
import { LeadlistComponent } from './leadlist/leadlist.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [LeadregistationComponent,LeadlistComponent],
  imports: [
    CommonModule,
    LeadregistationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ]
})
export class LeadregistationModule { }
