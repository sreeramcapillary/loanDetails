import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { HttpClient } from '@angular/common/http';
import {ExcelService} from '../../../helpers/services/excel.service';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
declare var $;
@Component({
  selector: 'app-downloadloans',
  templateUrl: './downloadloans.component.html',
  styleUrls: ['./downloadloans.component.scss']
})
export class DownloadloansComponent implements OnInit {

  mobileNumber:any
  otpSent:boolean = false
  otpValue:any
  token:any

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, private excelService:ExcelService,private formBuilder: FormBuilder) {
        
     }

  ngOnInit() {
    this.appService.changeActiveTab("downloadloans")
  }
 
  togglemenu(){
    $("#wrapper").toggleClass("toggled");
  }

  sendOtp(){
      this.appService.sendOtp(this.mobileNumber)
    .subscribe(
      (data: any) => {
        console.log(data)
      });
    // this.otpSent = true
  }

  // exportDetailedData():void {
  //   this.appService.getCurrentDetailedReportsDataForExcel()
  //   .subscribe(
  //     (data: any) => {
  //       if (data.status) {
  //         this.detailedData = data.loanDetails
  //         // console.log(this.detailedData)
  //         this.excelService.exportAsExcelFile(this.detailedData, 'DetailedReports');
  //       }
  //     });
  // }
}
