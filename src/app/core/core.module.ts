import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';
import { CoreRoutingModule } from './core-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CoreRoutingModule,ReactiveFormsModule,FormsModule
  ],
  declarations: [LoginComponent],
  exports: [RouterModule],
})
export class CoreModule { }
