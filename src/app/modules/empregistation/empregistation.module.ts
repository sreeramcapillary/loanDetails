import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmpregistationRoutingModule } from './empregistation-routing.module';
import { EmpregistationComponent } from './empregistation/empregistation.component';
import { EmplistComponent } from './emplist/emplist.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
@NgModule({
  declarations: [EmpregistationComponent,EmplistComponent],
  imports: [
    CommonModule,
    EmpregistationRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot()
    
  ]
})
export class EmpregistationModule { }
