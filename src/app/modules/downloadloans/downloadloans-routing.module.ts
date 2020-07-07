import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DownloadloansComponent } from './downloadloans/downloadloans.component';

const routes: Routes = [{
  path: '',
  component: DownloadloansComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadloansRoutingModule { }
