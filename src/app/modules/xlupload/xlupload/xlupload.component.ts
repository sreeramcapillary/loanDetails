import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { HttpClient } from '@angular/common/http';

declare var $;
const URL = 'http://localhost:3000/uploadExcel';

@Component({
  selector: 'app-xlupload',
  templateUrl: './xlupload.component.html',
  styleUrls: ['./xlupload.component.scss']
})
export class XluploadComponent implements OnInit {
  fileData: File = null;
  fileToUpload: File;
  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'leadExcel' });
  xluploaddata: any;
  emplist: any;
  loanDetails: any;
  bucketList: any;
  languageList: any;

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService) {
  }

  ngOnInit() {
    this.getAllEmp()
    this.getAllBucket()
    this.getAllLanguage()
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (response) {
        this.xluploaddata = JSON.parse(response);
        if(this.xluploaddata){
          this.appService.xlupload(this.xluploaddata).subscribe(
          (data: any) => {
            if (data.status) {
              this.loanDetails=[];

              this.loanDetails['bucket'] = [];
              for (var i = 0; i < this.xluploaddata.data.length; i++) {
                var bucket = this.xluploaddata.data[i].bucket;
                if (bucket in this.loanDetails == false) {
                  this.loanDetails['bucket'][bucket] = []; // must initialize the sub-object, otherwise will get 'undefined' errors
                }
                this.loanDetails['bucket'][bucket]['langauage']=[];
                for (var j = 0; j < this.xluploaddata.data.length; j++) {
                  if(this.xluploaddata.data[i].bucket ==  this.xluploaddata.data[j].bucket)
                 { 
                  var state = this.xluploaddata.data[j].state.toLowerCase();
                  if (state in this.loanDetails == false) {
                    this.loanDetails['bucket'][bucket]['langauage'][state] = []; // must initialize the sub-object, otherwise will get 'undefined' errors
                  }
                  var loandatadetails =[]
                  var empdetails =[]
                  var totalLoanDataValue=0;
                  for (var k = 0; k < this.xluploaddata.data.length; k++) {
                    if(this.xluploaddata.data[j].bucket ==  this.xluploaddata.data[k].bucket && this.xluploaddata.data[j].state.toLowerCase() ==  this.xluploaddata.data[k].state.toLowerCase())
                   {    
                      totalLoanDataValue = totalLoanDataValue + parseInt(this.xluploaddata.data[k].repayment_amt) ;
                      this.xluploaddata.data[k].is_assigned = false;
                      loandatadetails.push(this.xluploaddata.data[k])
                    }
                  }
                  this.emplist.map(elist => {
                    if (elist.state_name.toLowerCase() == this.xluploaddata.data[j].state.toLowerCase() && elist.bucket == this.xluploaddata.data[j].bucket) {
                        var empdata ={
                          "empid" :elist.id,
                          "assigned":false
                        }
                        empdetails.push(empdata);
                      }
                    })
                    this.loanDetails['bucket'][bucket]['langauage'][state]['loanData']= loandatadetails;
                    this.loanDetails['bucket'][bucket]['langauage'][state]['empdetails']= empdetails;
                    this.loanDetails['bucket'][bucket]['langauage'][state]['totalLoanDataValue']= totalLoanDataValue;
                  }
                  
                }
               
              }
              console.log(this.loanDetails);
      
              var finalFilteredArray = [];
      
               for (var bucketKey in this.loanDetails['bucket']) {
                for (var languageKey in this.loanDetails['bucket'][bucketKey]["langauage"]) {
                  var employeeCount =  this.loanDetails['bucket'][bucketKey]["langauage"][languageKey]["empdetails"].length;
                  if(employeeCount > 0){
                    var averageLoanValue = (parseInt(this.loanDetails['bucket'][bucketKey]["langauage"][languageKey]["totalLoanDataValue"],10) / employeeCount);
                   // console.log(this.loanDetails['bucket'][bucketKey]["langauage"][languageKey]["empdetails"])
                   var ldata;
                      var aempid
                    this.loanDetails['bucket'][bucketKey]["langauage"][languageKey]["loanData"].map(data => {
                      
                      this.loanDetails['bucket'][bucketKey]["langauage"][languageKey]["empdetails"].map(emp =>{
                        if(averageLoanValue <= data.repayment_amt && data.is_assigned == false && aempid != emp.empid){
                          aempid = emp.empid;
                          data["is_assigned"] = true;
                           ldata = {
                            "loan_id":data.loan_id,
                            "assigned_emp_id": emp.empid,
                            "is_assigned":1
                          }
                          finalFilteredArray.push(ldata)
                        }
                      })
                    })
                  }
                }
               }
               console.log(finalFilteredArray)
               if(finalFilteredArray){
                  this.appService.updateLoanData(finalFilteredArray).subscribe(
                  (data: any) => {
                    if (data.status) {
                      alert('File uploaded successfully');
                      this.router.navigate(['/assignLoanList'])
                    }
                  });
               }            }
          });
    
        
        }
        //  this.appService.xlupload(this.xluploaddata).subscribe(
        //   (data: any) => {
        //     if (data.status) {
        //       this.router.navigate(['/assignLoanList'])
        //     }
        //   });
      }
     //
    };
  }
  getAllBucket() {
    this.appService.bucketList()
      .subscribe(
        (data: any) => {
          console.log(data)
          this.bucketList = data.bucketList
        });
  }
  getAllLanguage() {
    this.appService.laguageList()
      .subscribe(
        (data: any) => {
          console.log(data)
          this.languageList = data.languageList
        });
  }
  getAllEmp() {
    this.appService.getEmp().subscribe(
      (data: any) => {
        if (data.status) {
          console.log(data)
          this.emplist = data.userDetails
          // this.router.navigate(['/assignLoanList'])
        }
      });
  }
  clickSide(val) {
    if (val == 'elist') {
      this.router.navigate(['/emp-list']);

    } else if (val == 'xlupload') {
      this.router.navigate(['/xl-upload']);

    } else if (val == 'aloan') {
      this.router.navigate(['/assignLoanList']);

    }
  }
  togglemenu() {
    $("#wrapper").toggleClass("toggled");

  }
}
