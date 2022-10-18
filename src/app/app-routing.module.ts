import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './helpers/guards/auth.guard';
const routes: Routes = [
  {
    path: 'login',
    loadChildren: './core/core.module#CoreModule', 
  },
  {
    path: '',
    loadChildren: './modules/home/home.module#HomeModule', 
    canActivate: [AuthGuard]
  },
  
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
