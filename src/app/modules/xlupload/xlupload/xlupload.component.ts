import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

declare var $;
// const URL = 'http://localhost:3000/uploadExcel'; // Local
const URL = 'http://148.72.212.163/backend/uploadExcel'; // Live

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
  emplist: any[];
  loanDetails: any[];
  bucketList: any;
  languageList: any;
  usersWithKnownLanguages: any[];
  newDataForm: FormGroup;
  batchStatus : any;

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, public fb: FormBuilder) {
  }

  ngOnInit() {
    this.appService.changeActiveTab("xlupload")

    this.newDataForm = this.fb.group({
      newBatch : ["NO"]
    });
    // this.getAllEmp()
    // this.getAllBucket()
    // this.getAllLanguage()
    this.getUsersWithKnownLanguages()
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (response) {
        this.xluploaddata = JSON.parse(response);
        if (this.xluploaddata) {
          if(this.newDataForm.value.newBatch == "YES"){
            this.inactiveCurrentBatch()
          }
          this.appService.xlupload(this.xluploaddata).subscribe(
            (data: any) => {
              if (data.status) {
                this.loanDetails = []
                this.loanDetails['bucket'] = [];
                //Making bucket array
                this.xluploaddata.data.map((row,key) => {
                  if(!this.loanDetails["bucket"].includes(row.bucket)){
                    this.loanDetails["bucket"][row.bucket] = [];
                    this.loanDetails['bucket'][row.bucket]['language'] = [];
                  }
                })
                //Making language array
                this.xluploaddata.data.map((row,key) => {
                  if(!this.loanDetails["bucket"][row.bucket]["language"].includes(row.state.toLowerCase())){
                    this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()] = [];
                    this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["loanData"] = [];
                    this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["empdetails"] = [];
                    this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["totalLoanDataValue"] = 0;
                  }
                })
                //Pushing the loan details to respective bucket,langugage,state and employee details
                this.xluploaddata.data.map((row,key) => {
                  row.is_assigned = false
                  this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["loanData"].push(row)
                  this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["totalLoanDataValue"] = this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["totalLoanDataValue"] + parseInt(row.repayment_amt)


                  this.emplist.map(elist => {
                    if (elist.state_name.toLowerCase() == row.state.toLowerCase() && elist.bucket == row.bucket) {
                      var empdata = {
                        "empid": elist.id,
                        "assigned" : false
                      }
                      this.loanDetails['bucket'][row.bucket]['language'][row.state.toLowerCase()]["empdetails"].push(empdata);
                    }
                  })
                })

                // console.log("bucket array", this.loanDetails)
                // this.loanDetails = [];
                // this.loanDetails['bucket'] = [];
                // for (var i = 0; i < this.xluploaddata.data.length; i++) {
                //   var bucket = this.xluploaddata.data[i].bucket;
                //   if (bucket in this.loanDetails == false) {
                //     this.loanDetails['bucket'][bucket] = []; // must initialize the sub-object, otherwise will get 'undefined' errors
                //   }
                //   this.loanDetails['bucket'][bucket]['langauage'] = [];
                //   for (var j = 0; j < this.xluploaddata.data.length; j++) {
                //     if (this.xluploaddata.data[i].bucket == this.xluploaddata.data[j].bucket) {
                //       var state = this.xluploaddata.data[j].state.toLowerCase();
                //       if (state in this.loanDetails == false) {
                //         this.loanDetails['bucket'][bucket]['langauage'][state] = []; // must initialize the sub-object, otherwise will get 'undefined' errors
                //       }
                //       var loandatadetails = []
                //       var empdetails = []
                //       var totalLoanDataValue = 0;
                //       for (var k = 0; k < this.xluploaddata.data.length; k++) {
                //         if (this.xluploaddata.data[j].bucket == this.xluploaddata.data[k].bucket && this.xluploaddata.data[j].state.toLowerCase() == this.xluploaddata.data[k].state.toLowerCase()) {
                //           totalLoanDataValue = totalLoanDataValue + parseInt(this.xluploaddata.data[k].repayment_amt);
                //           this.xluploaddata.data[k].is_assigned = false;
                //           loandatadetails.push(this.xluploaddata.data[k])
                //         }
                //       }
                //       this.emplist.map(elist => {
                //         if (elist.state_name.toLowerCase() == this.xluploaddata.data[j].state.toLowerCase() && elist.bucket == this.xluploaddata.data[j].bucket) {
                //           var empdata = {
                //             "empid": elist.id,
                //             "assigned" : false
                //           }
                //           empdetails.push(empdata);
                //         }
                //       })
                //       this.loanDetails['bucket'][bucket]['langauage'][state]['loanData'] = loandatadetails;
                //       this.loanDetails['bucket'][bucket]['langauage'][state]['empdetails'] = empdetails;
                //       this.loanDetails['bucket'][bucket]['langauage'][state]['totalLoanDataValue'] = totalLoanDataValue;
                //     }

                //   }

                // }
               console.log("Loan Details Filetered", this.loanDetails);

                //Getting unique employee array and setting assigned loans count to 0 
                let uniqueEmployeeList = []
                this.emplist.map(employee => {
                  if(typeof uniqueEmployeeList[employee.userId] === 'undefined') {
                    uniqueEmployeeList[employee.userId] = 0
                  }
                })
              //  console.log("uniqueEmployeeList", uniqueEmployeeList)

                var finalFilteredArray = [];

                for (var bucketKey in this.loanDetails['bucket']) {
                  for (var languageKey in this.loanDetails['bucket'][bucketKey]["language"]) {
                    var employeeCount = this.loanDetails['bucket'][bucketKey]["language"][languageKey]["empdetails"].length;
                    // console.log("employeeCount for bucket "+bucketKey+" => Language "+languageKey+" : ",employeeCount)
                    if (employeeCount > 0) {
                      var averageLoanValue = (parseInt(this.loanDetails['bucket'][bucketKey]["language"][languageKey]["totalLoanDataValue"], 10) / employeeCount);
                      console.log("averageLoanValue for bucket "+bucketKey+" => Language "+languageKey+" : "+averageLoanValue+", totalLoanDataValue : "+parseInt(this.loanDetails['bucket'][bucketKey]["language"][languageKey]["totalLoanDataValue"], 10))
                      // console.log(this.loanDetails['bucket'][bucketKey]["language"][languageKey]["empdetails"])
                      var ldata;
                      var aempid

                      this.loanDetails['bucket'][bucketKey]["language"][languageKey]["empdetails"].map(emp => {
                        let totalAmountAssigned = 0
                        this.loanDetails['bucket'][bucketKey]["language"][languageKey]["loanData"].map(data => {
                          if (uniqueEmployeeList[emp.empid] <= 120 && totalAmountAssigned <= averageLoanValue && data.is_assigned == false){
                            totalAmountAssigned = (totalAmountAssigned+parseInt(data.repayment_amt, 10))
                            //Incrementing count of loans assigned to individual employee
                            uniqueEmployeeList[emp.empid] = (uniqueEmployeeList[emp.empid]+1) 
                            data["is_assigned"] = true;
                            ldata = {
                              "loan_id": data.loan_id,
                              "assigned_emp_id": emp.empid,
                              "is_assigned": 1
                            }
                            finalFilteredArray.push(ldata)
                          }
                        })
                      })
                      // this.loanDetails['bucket'][bucketKey]["language"][languageKey]["loanData"].map(data => {
                      //   this.loanDetails['bucket'][bucketKey]["language"][languageKey]["empdetails"].map(emp => {
                      //     if (averageLoanValue <= data.repayment_amt && data.is_assigned == false && aempid != emp.empid) {
                      //       aempid = emp.empid;
                      //       data["is_assigned"] = true;
                      //       ldata = {
                      //         "loan_id": data.loan_id,
                      //         "assigned_emp_id": emp.empid,
                      //         "is_assigned": 1
                      //       }
                      //       finalFilteredArray.push(ldata)
                      //     }
                      //   })
                      // })
                    }
                  }
                }
                //console.log("uniqueEmployeeList", uniqueEmployeeList)
               console.log("finalFilteredArray", finalFilteredArray)
              //  return false
                if (finalFilteredArray) {
                  this.appService.updateLoanData(finalFilteredArray).subscribe(
                    (data: any) => {
                      if (data.status) {
                        alert('File uploaded successfully');
                        this.router.navigate(['/assignLoanList'])
                      }
                    });
                }
              }
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
          // console.log(data)
          this.bucketList = data.bucketList
        });
  }
  getAllLanguage() {
    this.appService.laguageList()
      .subscribe(
        (data: any) => {
          // console.log(data)
          this.languageList = data.languageList
        });
  }
  inactiveCurrentBatch(){
    this.appService.inactiveCurrentBatch()
    .subscribe(
      (data: any) => {
        //console.log("Invactive Branch", data)
      });
  }
  getUsersWithKnownLanguages(){
    this.appService.usersWithKnownLanguages()
      .subscribe(
        (data: any) => {
          // console.log("originalusersLanguages",data.languageList)
          // let filteredUsersData = [];
          // let usersLanguages = [];
          // let fileteredUsersLanguages = [];
          // data.languageList.map(user =>{
          //   if(typeof usersLanguages[user.userId] === 'undefined') {
          //     usersLanguages[user.userId] = [];
          //     usersLanguages[user.userId][user.language_id] = user.language_name
          //   }
          //   else {
          //       usersLanguages[user.userId][user.language_id] = user.language_name
          //   }
          // })

          // console.log("usersLanguages",usersLanguages)

          // usersLanguages.map((user, userIndex) => {
          //   let langs = []
          //   user.map((lang, langIndex) => {
          //     if(langs.indexOf(lang) == -1){
          //       langs[langIndex] = lang
          //     }
          //   })
          //   fileteredUsersLanguages[userIndex] = langs
          // })

          // console.log("fileteredUsersLanguages",fileteredUsersLanguages)

          // data.languageList.map((user, userIndex) =>{
          //   if(typeof fileteredUsersLanguages[user.userId][user.language_id] === 'undefined') {

          //   }else{
          //     filteredUsersData.push(user)
          //   }
          // })

          // console.log("finalarray", filteredUsersData)
          this.emplist = data.languageList
         // console.log(this.emplist)
        });
  }
  getAllEmp() {
    this.appService.getEmp().subscribe(
      (data: any) => {
        if (data.status) {
          // console.log("employee List", data)
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

    }else if(val == 'oldxlupload'){
      this.router.navigate(['/oldxlupload']);

    }else if(val == 'repaymentdataupload'){
      this.router.navigate(['/repaymentupload']);

    }else if(val == 'reports'){
      this.router.navigate(['/reports']);

    }
  }
  togglemenu() {
    $("#wrapper").toggleClass("toggled");

  }
}
