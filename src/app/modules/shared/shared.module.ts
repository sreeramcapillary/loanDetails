import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSelectDirective } from 'ng2-file-upload';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NavigationComponent } from './navigation/navigation.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [FileSelectDirective, NavigationComponent, TopbarComponent, FooterComponent],
  imports: [
    CommonModule,
    NgxDatatableModule
  ],
  exports: [FileSelectDirective,NgxDatatableModule,NavigationComponent, TopbarComponent, FooterComponent ],

})
export class SharedModule { }
