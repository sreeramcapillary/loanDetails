import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ExcelService} from '../../../helpers/services/excel.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var $;

@Component({
  selector: 'app-filtered-loans',
  templateUrl: './filtered-loans.component.html',
  styleUrls: ['./filtered-loans.component.scss']
})
export class FilteredLoansComponent implements OnInit {
  rows = [];
  empList: any;
  userType: string;
  selectForm: FormGroup;
  theCheckbox:any= [];
  loan_id: any=[];
  selectedEmployee: any;
  assignedLoan: any =[];
  assignedLoanData: any;
  assignedToId: any;
  assignedLoanId: any;
  selectedLoanId: any;
  filteredExportData: any = []
  filteredRows= [];
  dropdownSettings: IDropdownSettings = {} ;
  bucketList: any = [];
  // marked = false;
  // theCheckbox = false;
  constructor(private route: ActivatedRoute,
    private router: Router,private appService: AppService,private formBuilder: FormBuilder, private excelService:ExcelService) {
      this.userType = localStorage.getItem("usertype");
      if(this.userType != '1' && this.userType != '2'){
        this.router.navigateByUrl('/login');
      } 
    }

  ngOnInit() {
    this.appService.changeActiveTab("filteredloan")

    this.getAllEmp();

    this.getAllLoanDetails();
    //this.getAssinedLoanDetails();
    this.selectForm = this.formBuilder.group({
      employee: ['', Validators.required], 
      selectedBucket: [''], 
      noOfLoansSelected: [''],
      loanIdFilterValue: ['']
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'value',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };

    this.getBucketList();

    // this.bucketList = [
    //   { "id": "B1", 
    //     "value":  "B1", 
    //   },
    //   { "id": "B2", 
    //   "value":  "B2", 
    //   },
    //   { "id": "B3", 
    //   "value":  "B3", 
    //   },
    //   { "id": "B4", 
    //   "value":  "B4", 
    //   },
    //   { "id": "B5", 
    //   "value":  "B5", 
    //   },
    //   { "id": "B5", 
    //   "value":  "B6", 
    //   }
    // ]

  }
  
  getAllEmp(){
    this.appService.getActiveEmp()
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.empList=data.userDetails;
        }
      });
  }

  getBucketList(){
    this.appService.bucketList()
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.bucketList=data.bucketList;
        }
      });
  }
  
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getAllLoanDetails(){
    this.appService.getFilteredLoanDetailsList()
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.filteredExportData = data.loanDetails
          // console.log(data.loanDetails)
          this.theCheckbox = [];
          this.assignedLoan = [];
          data.loanDetails.map((loan,index) => {
            //this.theCheckbox.push(false)
            data.loanDetails[index].theCheckbox = false;
            data.loanDetails[index].assignedLoan = false;
          })
          
          this.rows = data.loanDetails;
          this.filteredRows = data.loanDetails;
	      // this.getAssinedLoanDetails();
        //  console.log(this.rows)
        }
      });
  }

  filterLoansById(){
    const loanIdFilterValuee = this.f.loanIdFilterValue.value.toLowerCase()
    let filteredDataTemp = []
    filteredDataTemp = this.filteredRows.filter(function(d) {
      return d.loan_id.toString().toLowerCase().indexOf(loanIdFilterValuee) !== -1 || d.mobile.toString().toLowerCase().indexOf(loanIdFilterValuee) !== -1 || !loanIdFilterValuee;
    });
    this.rows = filteredDataTemp;
  }

  checkLoans(){
    this.customFilteringForBucket(this.f.selectedBucket.value)
    this.loan_id = []
    this.theCheckbox = [];
    if(this.f.noOfLoansSelected.value>0){
      this.rows.map((row, index) => {
        if(index<this.f.noOfLoansSelected.value){
          this.rows[index].theCheckbox = true
          this.loan_id.push(row.loan_id)
        }else{
          this.rows[index].theCheckbox = false
        }
      })
    }else{
      this.rows.map((row, index) => {
        this.rows[index].theCheckbox = false
      })
    }
    // console.log(this.loan_id)
  }

  customFilteringForBucket(bucket){
    const val = bucket.toLowerCase();
    let filteredDataTemp = []
    filteredDataTemp = this.filteredRows.filter(function(d) {
      return d.bucket.toString().toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = filteredDataTemp;
  }

  get f() { 
    return this.selectForm.controls;
   }

  selectedEmp(){
    if(this.assignedToId ==  this.f.employee.value &&  this.selectedLoanId == this.assignedLoanId){
      alert("Employee is already assigned to this Loan")
      this.selectForm.patchValue({
        'employee':''
      })

    }else{
      this.selectedEmployee = this.f.employee.value

    }
   
  }
  toggleVisibility(e,data){
   // console.log(e)
   this.assignedToId = data.assigned_emp_id;
   this.assignedLoanId = data.assignedLoanId
   this.selectedLoanId = data.loan_id
   
    if(this.selectedEmployee == data.assigned_emp_id && data.loan_id == data.assignedLoanId){
      alert("Employee is already assigned to this Loan")
      e.target.checked = false;
    }else{
      if(e.target.checked == true){
        this.loan_id.push(data.loan_id);
      }
    }
    
  }

  assignLoanDetails(){
    if(this.selectedEmployee )
    var data ={
      'empId': this.selectedEmployee,
      'loanId': this.loan_id
    }
    this.appService.assignLoan(data)
    .subscribe(
      (data: any) => {
       // console.log(data)
        if(data.status){
          alert(data.message)
          this.loan_id=[];
          this.getAllLoanDetails();
          // this.getAssinedLoanDetails();
         
        }
      });
    }

    exportFilteredData():void{
      this.excelService.exportAsExcelFile(this.filteredExportData, 'FilteredData');
    }
}
