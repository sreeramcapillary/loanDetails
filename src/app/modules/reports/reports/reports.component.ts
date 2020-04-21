import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { HttpClient } from '@angular/common/http';
import {ExcelService} from '../../../helpers/services/excel.service';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';

import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';

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
  userType : any
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
  public dateTime1: Date;
  public dateTime2: Date;
  selectForm: FormGroup;
  attendanceData : any = []
  showPresentData : boolean = false
  attendancePresentData : any = []
  showAbsentData : boolean = false
  attendanceAbsentData : any = []
  attendancePresentDataTemp : any = []
  countAndSumReportData : any = []
  countAndSumTeamLeadReportData : any = []

  //pie chart
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: any[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors = [
    {
      backgroundColor: [],
    },
  ];

  //Bar chart
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'PTP' },
    { data: [], label: 'SWITCH OFF' },
    { data: [], label: 'RNR' },
    { data: [], label: 'PEA' },
    { data: [], label: 'WFC' }
    
  ];

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, private excelService:ExcelService,private formBuilder: FormBuilder) {
        this.userType = localStorage.getItem("usertype");
        if(this.userType != '1' && this.userType != '2'){
          this.router.navigateByUrl('/login');
        }

        monkeyPatchChartJsTooltip();
        monkeyPatchChartJsLegend();
     }

  ngOnInit() {
    this.appService.changeActiveTab("reports")

    var today = new Date();
    var dd = String(("0" + today.getDate()).slice(-2)).padStart(2, '0');
    var mm = String(("0" + (today.getMonth() + 1)).slice(-2)).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayDate = yyyy + '-' + mm + '-' + dd;
    this.getCountAndSumReport(todayDate, todayDate, 1)
    setTimeout(() => {
      this.getCountAndSumTeamLeadReport(todayDate, todayDate, 1)
    },2000)

    // this.getAllReports(todayDate, todayDate, 1)
    // this.getAttendanceData(todayDate)
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

  getCountAndSumReport(fromDate, toDate, batch){
    this.appService.getCountAndSumReport(fromDate, toDate, batch)
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.countAndSumReportData = data.reportData[0]
          this.pieChartLabels.push(['PTP ('+this.countAndSumReportData.PTP_AMOUNT_COUNT+')'], ['SWITCH OFF ('+this.countAndSumReportData.SWITCH_OFF_COUNT+')'], ['RNR ('+this.countAndSumReportData.RNR_AMOUNT_COUNT+')'], ['PEA ('+this.countAndSumReportData.PAYMENT_EXPECTED_AT_COUNT+')'], ['WFC ('+this.countAndSumReportData.WAITING_FOR_CONFIRMATION_COUNT+')']);
          this.pieChartData.push(this.countAndSumReportData.PTP_AMOUNT_TOTAL, this.countAndSumReportData.SWITCH_OFF_TOTAL, this.countAndSumReportData.RNR_AMOUNT_TOTAL, this.countAndSumReportData.PAYMENT_EXPECTED_AT_TOTAL, this.countAndSumReportData.WAITING_FOR_CONFIRMATION_TOTAL);
          this.pieChartColors[0].backgroundColor.push('#ff8f00ad', '#dc3545a8', '#5e35b1a3', '#388e3cb5', '#ff8f00ad');
        }
      });
  }

  getCountAndSumTeamLeadReport(fromDate, toDate, batch){
    this.appService.getCountAndSumTeamLeadReport(fromDate, toDate, batch)
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.countAndSumTeamLeadReportData = data.reportData
          let dataLeads = []
          let dataPTP = []
          let dataSWITCHOFF = []
          let dataRNR = []
          let dataPEA = []
          let dataWFC = []
          this.countAndSumTeamLeadReportData.map(teamLead => {
            dataLeads.push(teamLead.name)
            dataPTP.push(teamLead.PTP_AMOUNT_TOTAL)
            dataSWITCHOFF.push(teamLead.SWITCH_OFF_TOTAL)
            dataRNR.push(teamLead.RNR_AMOUNT_TOTAL)
            dataPEA.push(teamLead.PAYMENT_EXPECTED_AT_TOTAL)
            dataWFC.push(teamLead.WAITING_FOR_CONFIRMATION_TOTAL)
          })
          this.barChartLabels = dataLeads
          this.barChartData[0].data = dataPTP;
          this.barChartData[1].data = dataSWITCHOFF;
          this.barChartData[2].data = dataRNR;
          this.barChartData[3].data = dataPEA;
          this.barChartData[4].data = dataWFC;
        }
      });
  }


  getAllReports(fromDate, toDate, batch){
    this.appService.getReports(fromDate, toDate, batch)
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
        }
      });
  }

  getAttendanceData(date){
    this.appService.getAttendance(date)
    .subscribe(
      (data: any) => {
        if (data.status) {
         this.attendanceData = data.attendanceData
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

  reportsByDate(){
    var date = new Date(this.dateTime1);
    var month = ("0" + (date.getMonth() + 1)).slice(-2)
    var fulldate = ("0" + date.getDate()).slice(-2)
    var year = date.getFullYear()
    let selectedFromDate = year+"-"+month+"-"+fulldate

    var date = new Date(this.dateTime2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2)
    var fulldate = ("0" + date.getDate()).slice(-2)
    var year = date.getFullYear()
    let selectedToDate = year+"-"+month+"-"+fulldate
    if(selectedToDate == "NaN-aN-aN"){
      selectedToDate = selectedFromDate
    }

    //Making consolidate data as 0
    this.consolidatedData.assigned = 0
    this.consolidatedData.assignedCount = 0
    this.consolidatedData.ptp = 0
    this.consolidatedData.ptpCount = 0
    this.consolidatedData.rnr = 0
    this.consolidatedData.rnrCount = 0
    this.consolidatedData.sa = 0
    this.consolidatedData.saCount = 0
    this.consolidatedData.pea = 0
    this.consolidatedData.peaCount = 0
    this.consolidatedData.wfc = 0
    this.consolidatedData.wfcCount = 0
    this.consolidatedData.rpy = 0
    this.consolidatedData.rpyCount = 0

    this.getAllReports(selectedFromDate, selectedToDate, 0)
  }

  getAttendancePresentData(){
    var today = new Date();
    var dd = String(("0" + today.getDate()).slice(-2)).padStart(2, '0');
    var mm = String(("0" + (today.getMonth() + 1)).slice(-2)).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayDate = yyyy + '-' + mm + '-' + dd;

    this.appService.getAttendancePresentData(todayDate)
    .subscribe(
      (data: any) => {
        if (data.status) {
         this.attendancePresentData = data.attendancePresentData
        }
      });
    this.showPresentData = true
  }

  getAttendanceAbsentData(){
    var today = new Date();
    var dd = String(("0" + today.getDate()).slice(-2)).padStart(2, '0');
    var mm = String(("0" + (today.getMonth() + 1)).slice(-2)).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayDate = yyyy + '-' + mm + '-' + dd;

    this.appService.getAttendancePresentData(todayDate)
    .subscribe(
      (data: any) => {
      if (data.status) {
        data.attendancePresentData.map(item =>{
          this.attendancePresentDataTemp.push(item.id)
        })
      }
    });

    this.appService.getActiveEmp()
    .subscribe(
      (data: any) => {
        if (data.status) {
        data.userDetails.map(emp => {
          if(!this.attendancePresentDataTemp.includes(emp.id)){
            let empData = {
              "id"  : emp.id,
              "name"  : emp.name
            }
            this.attendanceAbsentData.push(empData)
          }
        })
        }
      });
    this.showAbsentData = true
  }

  closeModal(){
    this.showPresentData = false
    this.showAbsentData = false
  }
}
