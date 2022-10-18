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
  loanData:any

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
        if(data.code == 200){
          this.otpSent = true
        }else{
          alert("something went wrong. Please try again later");
        }
      });
  }

  downloadData(){
    this.appService.validateOtp(this.mobileNumber,this.otpValue)
    .subscribe(
      (data: any) => {
        
        if (data.status == "OK") {
          this.appService.downloadLoanData(data.token)
          .subscribe(
            (data: any) => {
              console.log(data)
              this.loanData = data.result
              this.excelService.exportAsExcelFile(this.loanData, 'LoanData');
            })
        }else{
          alert("Invalid OTP");
        }
      });
  }
}
