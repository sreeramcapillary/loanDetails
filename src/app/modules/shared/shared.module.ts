import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSelectDirective } from 'ng2-file-upload';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NavigationComponent } from './navigation/navigation.component';

@NgModule({
  declarations: [FileSelectDirective, NavigationComponent],
  imports: [
    CommonModule,
    NgxDatatableModule
  ],
  exports: [FileSelectDirective,NgxDatatableModule,NavigationComponent ],

})
export class SharedModule { }
