import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'emp-list',
        loadChildren: '../empregistation/empregistation.module#EmpregistationModule'
      },
      {
        path: 'lead-list',
        loadChildren: '../leadregistation/leadregistation.module#LeadregistationModule'
      },
      {
        path: 'xl-upload',
        loadChildren: '../xlupload/xlupload.module#XluploadModule'
      
      },
      {
        path: 'assignLoanList',
        loadChildren: '../assign-loan-list/assign-loan-list.module#AssignLoanListModule'
      },
      {
        path: 'unassignedLoanList',
        loadChildren: '../unassigned-loans/unassigned-loans.module#UnassignedLoansModule'
      },
      {
        path: 'filteredLoanList',
        loadChildren: '../filtered-loans/filtered-loans.module#FilteredLoansModule'
      },
      {
        path: 'singleEmployeeDataUpload',
        loadChildren: '../single-employee-data-upload/single-employee-data-upload.module#SingleEmployeeDataUploadModule'      
      },
      {
        path: 'cutomerloandetails',
        loadChildren: '../emplogin/emplogin.module#EmploginModule'
      },
      {
        path: 'oldxlupload',
        loadChildren: '../olddataupload/olddataupload.module#OlddatauploadModule'
      },
      {
        path: 'repaymentupload',
        loadChildren: '../repaymentdataupload/repaymentdataupload.module#RepaymentdatauploadModule'
      },
      {
        path: 'reports',
        loadChildren: '../reports/reports.module#ReportsModule'
      },
      {
        path: 'downloadloans',
        loadChildren: '../downloadloans/downloadloans.module#DownloadloansModule'
      },
      { path: '', redirectTo: 'emp-list', pathMatch: 'full' }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
