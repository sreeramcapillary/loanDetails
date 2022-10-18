import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { ColumnMode, SelectionType  } from '@swimlane/ngx-datatable';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {Md5} from 'ts-md5/dist/md5';
import {ExcelService} from '../../../helpers/services/excel.service';

const URL = 'http://localhost:3000/uploadFile';

declare var $;
@Component({
  selector: 'app-customerloandetails',
  templateUrl: './customerloandetails.component.html',
  styleUrls: ['./customerloandetails.component.scss']
})
export class CustomerloandetailsComponent implements OnInit {
  userType: string;
  rows= [];
  filteredRows= [];
  empId: string;
  cutomerDetials: any;
  selectForm: FormGroup;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'files'});
  filename: any;
  loanStatus: any;
  old_status: any;
  selected = [];
  SelectionType = SelectionType;
  loan_id: any;
  totalAssignedAmount = 0
  totalRecoveredAmount = 0
  totalPendingAmount = 0
  showActionsContainer:boolean = false
  empName = localStorage.getItem("empName")
  empUsername = localStorage.getItem("empId")
  empBucket = localStorage.getItem("bucket")
  loanPastStatus = []
  dropdownSettings: IDropdownSettings = {} ;
  principalAmountList: any;
  principalAmountUniqueList: any = []
  statusValuesList: any;
  statusValuesUniqueList: any = []
  public dateTime1: Date;
  currentSelectedRow: any
  mobileView : boolean = false
  callsDone : any = 0
  callsRemaining : any = 0
  whatsappMsgCustomer : any
  whatsappMsgRef1 : any
  whatsappMsgRef2 : any
  constructor(private router: Router,private appService: AppService,private formBuilder: FormBuilder, private excelService:ExcelService) { 
    
    this.userType = localStorage.getItem("usertype");
    this.empId = localStorage.getItem("userId");
    if(this.userType != '0'){
      this.router.navigateByUrl('/login');
    } 
    // this.getAllLoanDetails()
  }

  ngOnInit() {
    if(window.innerWidth <= 678){
      this.mobileView = true
    }
    
    this.getLoanStatus()
    this.selectForm = this.formBuilder.group({
      status: ['', Validators.required], 
      callType : ['Customer'],
      comment: [''],
      principalAmount:[''],
      statusValues:['']
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         if(response){
           this.filename = response;
          alert('File uploaded successfully');
         }
     };

     this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'value',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };

    var today = new Date();
    var dd = String(("0" + today.getDate()).slice(-2)).padStart(2, '0');
    var mm = String(("0" + (today.getMonth() + 1)).slice(-2)).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayDate = yyyy + '-' + mm + '-' + dd;
    this.getAllLoanDetails(todayDate)
  }
  getAllLoanDetails(date){
    this.appService.getAssignedLoanDetailsEmpByDate(this.empId, date)
    .subscribe(
      (data: any) => {
        if (data.status) { 
          this.principalAmountList = []
          this.rows = data.assignedLoanToEmp;
          this.filteredRows = data.assignedLoanToEmp;
          this.selected = [data[2]];
          data.assignedLoanToEmp.map(row => {
            if(row.calledToday == 1){
              this.callsDone++
            }else{
              this.callsRemaining++
            }
            this.totalAssignedAmount += row.principal_amt
            if(row.statusId == 6){
              this.totalRecoveredAmount += row.principal_amt
            }
            if(row.statusId == 5){
              this.totalPendingAmount += row.principal_amt
            }
            if(!this.principalAmountUniqueList.includes(row.principal_amt)){
              this.principalAmountUniqueList.push(row.principal_amt)
              var plist;
              plist = 
              { "id": row.principal_amt, 
                "value": row.principal_amt
              }
              this.principalAmountList.push(plist)
            }
          });
        }
      });
  }
  onSelect({ selected }) {
   if(selected[0].statusId!=6){
    this.currentSelectedRow = selected[0]
    this.showActionsContainer = true
    this.old_status = selected[0].old_status;
    this.loan_id = selected[0].loan_id;
    this.selectForm.patchValue({    
      "status": selected[0].statusId,
      "comment":selected[0].loan_comments
    });

    this.loanPastStatus = []
    this.appService.getLoanPastStatus(this.loan_id)
    .subscribe(
      (data: any) => {
        if (data.status) { 
          this.loanPastStatus = data.loanPastStatus
        }
      });
      this.whatsappMsgCustomer = "phone=91"+ selected[0].mobile +"&text=*Dear Customer,*%0a%0a*You have failed to make the repayment EMIs towards your loan taken from our LoanFront/VVPL-NBFC in spite of repeated reminders. Several reminders in respect of the same has evoked no response from your end, and thereby you have violated the terms and conditions envisaged in the Loan Agreement which you signed especially section [17, 18 & 19].*%0a%0a*We strongly urge you to remit the outstanding amount immediately failing which would lead to complete loan recall, and initiate further recovery action as per the agreement.*%0a%0aIn case you are facing financial difficulty, we would be happy to assist you in terms of reducing some penalty fee, flexible payment methods, loan restructuring etc., for which you need to call us on this number0a%0a*Request you to avail this opportunity and improve your credit profile to gain long term financial benefits from other banks/NBFCs.*0a%0a*Regards*0a%0a*VVPL NBFC*"
      this.whatsappMsgRef1 = "phone=91"+ selected[0].ref_mobile_num1 +"&text=Dear *"+selected[0].ref_name1+"*, %0a%0aMr. : *"+ selected[0].customer_Name +"* Have give ur Number as as reference  Regarding the loan from Loanfront We don’t have alternative option to reach Mr. *"+ selected[0].customer_Name +"* Kindly update Him/Her That We tried to help Him/Her out with different flexible payment options also, but she/he  is not responding to our calls. But now we have no choice but to initiate the legal procedure if she/he is  not paying the amount by today and the 'Suit filed' status will be updated to He's/Her CIBIL which will create a problem to get any loan in future from any other Bank(s). Request you to get in touch with our agent and discuss the payment plan to resolve the matter.%0a%0aTHANK YOU : *LOANFRONT*"
      this.whatsappMsgRef2 = "phone=91"+ selected[0].ref_mobile_num2 +"&text=Dear *"+selected[0].ref_name2+"*, %0a%0aMr. : *"+ selected[0].customer_Name +"* Have give ur Number as as reference  Regarding the loan from Loanfront We don’t have alternative option to reach Mr. *"+ selected[0].customer_Name +"* Kindly update Him/Her That We tried to help Him/Her out with different flexible payment options also, but she/he  is not responding to our calls. But now we have no choice but to initiate the legal procedure if she/he is  not paying the amount by today and the 'Suit filed' status will be updated to He's/Her CIBIL which will create a problem to get any loan in future from any other Bank(s). Request you to get in touch with our agent and discuss the payment plan to resolve the matter.%0a%0aTHANK YOU : *LOANFRONT*"
   }else{
    this.showActionsContainer = false
   }
  }

  editStatus(selectedLoan) {
    this.currentSelectedRow = selectedLoan
    this.showActionsContainer = true
    this.old_status = selectedLoan.old_status;
    this.loan_id = selectedLoan.loan_id;
    this.selectForm.patchValue({    
      "status": selectedLoan.statusId,
      "comment":selectedLoan.loan_comments
    });

    this.loanPastStatus = []
    this.appService.getLoanPastStatus(this.loan_id)
    .subscribe(
      (data: any) => {
        if (data.status) { 
          this.loanPastStatus = data.loanPastStatus
        }
      });
   }

   cancelStatusUpdate(){
    this.showActionsContainer = false
   }

  
  clickSide(val){
    if(val == 'cdetails'){
      this.router.navigate(['/cutomerloandetails']);

    }
  }
  viewDeials(row){
    // console.log(row)
     localStorage.setItem('customerData',JSON.stringify(row))
     this.router.navigate(['/cutomerloandetails/viewdetails']);
   
  }
  
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getLoanStatus(){
    this.appService.loanStatus()
    .subscribe(
      (data: any) => {
        this.statusValuesList = []
        if (data.status) { 
           //console.log(data.loanStatus)
           this.loanStatus = data.loanStatus
           this.loanStatus.map(status => {
            var slist;
            slist = 
            { "id": status.id, 
              "value": status.status_type
            }
            this.statusValuesList.push(slist)
           })
        }
      });
  }
  get f() { 
    return this.selectForm.controls;
   }
  submitDetails(){
    var data={
      loan_id:this.loan_id,
      current_Status : this.f.status.value,
      callType : this.f.callType.value,
      old_Status : this.old_status,
      document : this.filename,
      comment : this.f.comment.value,
    }
    // console.log(this.currentSelectedRow)
    // this.selectForm.reset()
    
    this.appService.updateLoanDetails(data)
    .subscribe(
      (data: any) => {
        if (data.status) { 
          // console.log(data.loanStatus)
            alert("Loan Details updated Successfully")
            this.showActionsContainer = false
            // location.reload()
            this.rows.map((row, index) => {
              if(row.id == this.currentSelectedRow.id){
                this.rows[index].statusId = this.f.status.value
                this.rows[index].loan_comments = this.f.comment.value
                this.loanStatus.map((status, statusIndex) =>{
                  if(status.id == this.f.status.value){
                    this.rows[index].status = this.loanStatus[statusIndex].status_type
                  }
                })
              }
            })
          }
      });
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    let filteredDataTemp = []
    
    // filter our data
    filteredDataTemp = this.filteredRows.filter(function(d) {
      // let x = d.loan_id.toString().toLowerCase().indexOf(val) !== -1 || !val;
      // console.log(x)
      return d.loan_id.toString().toLowerCase().indexOf(val) !== -1 || d.mobile.toString().toLowerCase().indexOf(val) !== -1 || d.ref_mobile_num1.toString().toLowerCase().indexOf(val) !== -1 || d.ref_mobile_num2.toString().toLowerCase().indexOf(val) !== -1 || !val;
    });

    //searching for mobile
    // if(filteredDataTemp.length == 0){
    //   this.rows = this.filteredRows
    //   filteredDataTemp = this.filteredRows.filter(function(d) {
    //     return d.mobile.toString().toLowerCase().indexOf(val) !== -1 || !val;
    //   });
    // }


    //ref_mobile_num1

    // update the rows
    this.rows = filteredDataTemp;
  }

  updateCustomFilters(){
    // console.log(this.f.principalAmount.value)
    let finalData = []
    if(this.f.principalAmount.value.length>0){
      this.f.principalAmount.value.map(row => {
        let filteredDataTemp = this.customFilteringForPrincipalAmount(row)
        finalData.push(filteredDataTemp)
      })
    }

    if(this.f.statusValues.value.length>0){
      this.f.statusValues.value.map(row => {
        let filteredDataTemp = this.customFilteringForStatusValues(row)
        finalData.push(filteredDataTemp)
      })
    }
    
    if(this.f.principalAmount.value.length>0 || this.f.statusValues.value.length>0){
      var finalFilteredData = [];
      for(var i = 0; i < finalData.length; i++)
      {
        finalFilteredData = finalFilteredData.concat(finalData[i]);
      }
      
      this.rows = finalFilteredData;
    }else{
      this.rows = this.filteredRows
    }
  }

  customFilteringForPrincipalAmount(value){
    const val = value
    let filteredDataTemp = []
    // filter our data
    filteredDataTemp = this.filteredRows.filter(function(d) {
        return d.principal_amt.toString().toLowerCase().indexOf(val) !== -1 || !val;
    });
    return filteredDataTemp
  }

  customFilteringForStatusValues(value){
    const val = value.id
    let filteredDataTemp = []
    // filter our data
    filteredDataTemp = this.filteredRows.filter(function(d) {
        if(d.statusId!=null){
          return d.statusId.toString().toLowerCase().indexOf(val) !== -1 || !val;
        }
    });
    return filteredDataTemp
  }

  updateDataByDate(){
    var date = new Date(this.dateTime1);
    var month = ("0" + (date.getMonth() + 1)).slice(-2)
    var fulldate = ("0" + date.getDate()).slice(-2)
    var year = date.getFullYear()
    let selectedDate = year+"-"+month+"-"+fulldate
    this.totalAssignedAmount = 0
    this.totalPendingAmount = 0
    this.totalRecoveredAmount = 0
    this.getAllLoanDetails(selectedDate)
  }

  downloadCustomerMobileNumbers(){
    let customerMobileNumbers = []
    this.rows.map(row => {
      customerMobileNumbers.push({"mobile" : row.mobile})
    })
    setTimeout(()=>{
      this.excelService.exportAsExcelFile(customerMobileNumbers, 'Customer Mobile Numbers');
    }, 500);
  }

}
