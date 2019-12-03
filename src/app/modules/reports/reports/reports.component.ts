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
  consolidatedData: any = {
    assigned : 0,
    assignedCount : 0,
    ptp : 0,
    ptpCount : 0,
    rnr : 0,
    rnrCount : 0,
    sa : 0,
    saCount : 0,
    pea : 0,
    peaCount : 0,
    wfc : 0,
    wfcCount : 0,
    rpy : 0,
    rpyCount : 0
  }
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
          this.onlyReportData.map( row => {
            this.consolidatedData.assigned += row.assignedAmount
            this.consolidatedData.assignedCount += row.assignedAmount_COUNT
            this.consolidatedData.ptp += row.PTP_AMOUNT
            this.consolidatedData.ptpCount += row.PTP_AMOUNT_COUNT
            this.consolidatedData.rnr += row.RNR_AMOUNT
            this.consolidatedData.rnrCount += row.RNR_AMOUNT_COUNT
            this.consolidatedData.sa += row.SWITCH_OFF
            this.consolidatedData.saCount += row.SWITCH_OFF_COUNT
            this.consolidatedData.pea += row.PAYMENT_EXPECTED_AT
            this.consolidatedData.peaCount += row.PAYMENT_EXPECTED_AT_COUNT
            this.consolidatedData.wfc += row.WAITING_FOR_CONFIRMATION
            this.consolidatedData.wfcCount += row.WAITING_FOR_CONFIRMATION_COUNT
            this.consolidatedData.rpy += row.collectedAmout
            this.consolidatedData.rpyCount += row.collectedAmout_COUNT
          })
          console.log(this.consolidatedData)
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
