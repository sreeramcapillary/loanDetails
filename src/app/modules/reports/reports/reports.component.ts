import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { HttpClient } from '@angular/common/http';
import {ExcelService} from '../../../helpers/services/excel.service';
declare var $;
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  rows: any;
  detailedData: any = []
  onlyReportData: any = []
  // exportdata: any = [{
  //   eid: 'e101',
  //   ename: 'ravi',
  //   esal: 1000
  // },
  // {
  //   eid: 'e102',
  //   ename: 'ram',
  //   esal: 2000
  // },
  // {
  //   eid: 'e103',
  //   ename: 'rajesh',
  //   esal: 3000
  // }];

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, private excelService:ExcelService) { }

  ngOnInit() {
    this.appService.changeActiveTab("reports")

    this.getAllReports()
  }
  clickSide(val) {
    if (val == 'elist') {
      this.router.navigate(['/emp-list']);

    } else if (val == 'xlupload') {
      this.router.navigate(['/xl-upload']);

    } else if (val == 'aloan') {
      this.router.navigate(['/assignLoanList']);

    }else if(val == 'oldxlupload'){
      this.router.navigate(['/oldxlupload']);

    }else if(val == 'repaymentdataupload'){
      this.router.navigate(['/repaymentupload']);

    }else if(val == 'reports'){
      this.router.navigate(['/reports']);

    }
  }
  getAllReports(){
    this.appService.getReports()
    .subscribe(
      (data: any) => {
        if (data.status) {
         // console.log(data.reportData)
          this.rows = data.reportData
          this.onlyReportData = data.reportData
        }
      });
  }

  togglemenu(){
    $("#wrapper").toggleClass("toggled");
  }

  exportDetailedData():void {
    this.appService.getCurrentDetailedReportsDataForExcel()
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.detailedData = data.loanDetails
          // console.log(this.detailedData)
          this.excelService.exportAsExcelFile(this.detailedData, 'DetailedReports');
        }
      });
  }
  exportReportData():void{
    this.excelService.exportAsExcelFile(this.onlyReportData, 'OnlyReports');
  }
}
