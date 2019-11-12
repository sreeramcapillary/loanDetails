import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './helpers/guards/auth.guard';
const routes: Routes = [{
  path: '',
  loadChildren: './core/core.module#CoreModule',
  pathMatch: 'full'
},
{
  path: 'login',
  loadChildren: './core/core.module#CoreModule',
  pathMatch: 'full'
},
{
  path: 'emp-list',
  loadChildren: './modules/empregistation/empregistation.module#EmpregistationModule',
  canActivate: [AuthGuard]

},
{
  path: 'xl-upload',
  loadChildren: './modules/xlupload/xlupload.module#XluploadModule',
  canActivate: [AuthGuard]

},
{
  path: 'assignLoanList',
  loadChildren: './modules/assign-loan-list/assign-loan-list.module#AssignLoanListModule',
  canActivate: [AuthGuard]

},
{
  path: 'unassignedLoanList',
  loadChildren: './modules/unassigned-loans/unassigned-loans.module#UnassignedLoansModule',
  canActivate: [AuthGuard]

},
{
  path: 'singleEmployeeDataUpload',
  loadChildren: './modules/single-employee-data-upload/single-employee-data-upload.module#SingleEmployeeDataUploadModule',
  canActivate: [AuthGuard]

},
{
  path: 'cutomerloandetails',
  loadChildren: './modules/emplogin/emplogin.module#EmploginModule',
  canActivate: [AuthGuard]

},
{
  path: 'oldxlupload',
  loadChildren: './modules/olddataupload/olddataupload.module#OlddatauploadModule',
  canActivate: [AuthGuard]

},
{
  path: 'repaymentupload',
  loadChildren: './modules/repaymentdataupload/repaymentdataupload.module#RepaymentdatauploadModule',
  canActivate: [AuthGuard]

},
{
  path: 'reports',
  loadChildren: './modules/reports/reports.module#ReportsModule',
  canActivate: [AuthGuard]

},
{ path: '**', redirectTo: '' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
