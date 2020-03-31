import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $;
@Component({
  selector: 'app-assign-loan-list',
  templateUrl: './assign-loan-list.component.html',
  styleUrls: ['./assign-loan-list.component.scss']
})
export class AssignLoanListComponent implements OnInit {
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
  filteredRows= [];
  statusValuesList: any;
  // marked = false;
  // theCheckbox = false;
  constructor(private route: ActivatedRoute,
    private router: Router,private appService: AppService,private formBuilder: FormBuilder) {
      this.userType = localStorage.getItem("usertype");
      if(this.userType != '1' && this.userType != '2'){
        this.router.navigateByUrl('/login');
      } 
    }

  ngOnInit() {
    this.appService.changeActiveTab("aloan")

    this.getAllEmp();

    this.getAllLoanDetails();
    //this.getAssinedLoanDetails();
    this.selectForm = this.formBuilder.group({
      employee: ['', Validators.required],
      // employeeToFilter: ['ALL'],
      employeeFilterValue: [''],
    });
  }
  clickSide(val){
    if(val == 'elist'){
      this.router.navigate(['/emp-list']);

    }else if(val == 'xlupload'){
      this.router.navigate(['/xl-upload']);

    }else if(val == 'aloan'){
      this.router.navigate(['/assignLoanList']);

    }else if(val == 'oldxlupload'){
      this.router.navigate(['/oldxlupload']);

    }else if(val == 'repaymentdataupload'){
      this.router.navigate(['/repaymentupload']);

    }else if(val == 'reports'){
      this.router.navigate(['/reports']);

    }
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
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getAllLoanDetails(){
    this.appService.getAssignedLoanDetailsList()
    .subscribe(
      (data: any) => {
        if (data.status) {
          // console.log(data.loanDetails)
          this.theCheckbox = [];
          this.assignedLoan = [];
          // data.loanDetails.map((loan,index) => {
          //   //this.theCheckbox.push(false)
          //   data.loanDetails[index].theCheckbox = false;
          //   data.loanDetails[index].assignedLoan = false;
          // })
          
          this.rows = data.loanDetails;
          this.filteredRows = data.loanDetails;
	        this.getAssinedLoanDetails();
        //  console.log(this.rows)
        }
      });
  }
  getAssinedLoanDetails(){
    this.appService.getAllAssinedLoanDetailsList()
    .subscribe(
      (data: any) => {
        if (data.status) {  
          this.assignedLoanData = data.assignedLoan;
          this.rows.map((loanData,index) =>{
            data.assignedLoan.map(aL => {
              if(loanData.loan_id == aL.loan_id){
                this.rows[index].assignedLoan = true;
                this.rows[index].assignedToName = aL.name;
               // this.rows[index].assignedToId = aL.assigned_emp_id;
                this.rows[index].assignedLoanId = aL.loan_id;

              }
            })
          })
          // console.log(this.rows)
        }
      });
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
          this.getAssinedLoanDetails();
         
        }
      });
    }

    unassignLoanDetails(){
      var data ={
        'loanId': this.loan_id
      }
      this.appService.unassignLoan(data)
      .subscribe(
        (data: any) => {
         // console.log(data)
          if(data.status){
            alert(data.message)
            location.reload()
            // this.loan_id=[];
            // this.getAllLoanDetails();
            // this.getAssinedLoanDetails();
           
          }
        });
      }

    filterLoansByEmp(){
      // const employeeFilterValue = this.f.employeeFilterValue.value.toLowerCase()
      // if(this.f.employeeToFilter.value == "ALL"){
      //   const val = ""
      //   let filteredDataTemp = []
      //   filteredDataTemp = this.filteredRows.filter(function(d) {
      //     return d.assigned_emp_id.toString().toLowerCase().indexOf(val) !== -1 || !val;
      //   });
      //   this.rows = filteredDataTemp;
      // }else{
      //   const val = this.f.employeeToFilter.value.toLowerCase();
      //   let filteredDataTemp = []
      //   filteredDataTemp = this.filteredRows.filter(function(d) {
      //     return d.assigned_emp_id.toString().toLowerCase().indexOf(val) !== -1 && (d.loan_id.toString().toLowerCase().indexOf(employeeFilterValue) !== -1 || d.overdue_days.toString().toLowerCase().indexOf(employeeFilterValue) !== -1 || !employeeFilterValue);
      //   });
      //   this.rows = filteredDataTemp;
      // }
      const employeeFilterValue = this.f.employeeFilterValue.value.toLowerCase()
      let filteredDataTemp = []
      filteredDataTemp = this.filteredRows.filter(function(d) {
        return (d.loan_id.toString().toLowerCase().indexOf(employeeFilterValue) !== -1 || d.Customer_id.toString().toLowerCase().indexOf(employeeFilterValue) !== -1) || d.mobile.toString().toLowerCase().indexOf(employeeFilterValue) !== -1 || !employeeFilterValue;
      });
      this.rows = filteredDataTemp;
    }
}