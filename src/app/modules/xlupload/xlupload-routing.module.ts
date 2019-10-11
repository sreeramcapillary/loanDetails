import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { XluploadComponent } from './xlupload/xlupload.component';

const routes: Routes = [{
  path: '',
  component: XluploadComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class XluploadRoutingModule { }
