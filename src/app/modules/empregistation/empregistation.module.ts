import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmpregistationRoutingModule } from './empregistation-routing.module';
import { EmpregistationComponent } from './empregistation/empregistation.component';
import { EmplistComponent } from './emplist/emplist.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [EmpregistationComponent,EmplistComponent],
  imports: [
    CommonModule,
    EmpregistationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ]
})
export class EmpregistationModule { }
