import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSelectDirective } from 'ng2-file-upload';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [FileSelectDirective],
  imports: [
    CommonModule,
    NgxDatatableModule
  ],
  exports: [FileSelectDirective,NgxDatatableModule ],

})
export class SharedModule { }
