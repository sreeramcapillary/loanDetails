import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import {ExcelService} from '../../../helpers/services/excel.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $;

@Component({
  selector: 'app-emplist',
  templateUrl: './emplist.component.html',
  styleUrls: ['./emplist.component.scss']
})
export class EmplistComponent implements OnInit {

  title = 'angular-datatables';
  rows= [];
  filteredRows= [];
  empListForm: FormGroup;
  userType: string;
  loansAssignedToEmployee: any = []
  constructor( private route: ActivatedRoute,
    private router: Router,private appService: AppService, private excelService:ExcelService,private formBuilder: FormBuilder) {
     
      this.userType = localStorage.getItem("usertype");
      if(this.userType != '1' && this.userType != '2'){
        this.router.navigateByUrl('/login');
      } 
    }


  ngOnInit() {
    this.appService.changeActiveTab("elist")

    this.getAllEmp();

    this.empListForm = this.formBuilder.group({
      employeeFilterValue: [''],
    });
  }

  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getAllEmp(){
    // this.appService.getEmp()
    this.appService.getActiveEmp()
    .subscribe(
      (data: any) => {
        if (data.status) {
          //.log(data.userDetails)
          this.rows = data.userDetails;
          this.filteredRows = data.userDetails;
        }
      });
  }
  registerEmp(){
    //console.log("emp")
    localStorage.setItem("editemp",JSON.stringify(''));

    this.router.navigate(['emp-list','emp-registation']);

  }
  editEmp(row){
    console.log(row)
    localStorage.setItem("editemp",JSON.stringify(row));
    this.router.navigate(['emp-list','emp-registation']);

  }
  deactivateEmp(row){
    var confirmation = confirm("Are you sure? You want to deactivate the employee!")
    console.log(confirmation)
    if(confirmation){
      this.appService.deActivateEmployee(row.id)
      .subscribe(
      (data:any) => {
      // console.log(data.status);
        if(data.status == true){
          alert(data.message)
          this.getAllEmp();
        }else{
            alert(data.message)
          
        }
      });
    }
   
  }

  deactivateEmpWRL(row){
    var confirmation = confirm("Are you sure? You want to deactivate the employee! (Data Will Remain As it is).")
    console.log(confirmation)
    if(confirmation){
      this.appService.deActivateEmployeeWithoutRemovingLoans(row.id)
      .subscribe(
      (data:any) => {
      // console.log(data.status);
        if(data.status == true){
          alert(data.message)
          this.getAllEmp();
        }else{
            alert(data.message)
          
        }
      });
    }
  }

  activateEmp(row){
    var confirmation = confirm("Are you sure? You want to activate the employee!")
    console.log(confirmation)
    if(confirmation){
      this.appService.activateEmployee(row.id)
      .subscribe(
      (data:any) => {
      // console.log(data.status);
        if(data.status == true){
          alert(data.message)
          this.getAllEmp();
        }else{
            alert(data.message)
          
        }
      });
    }
  }
  downloadEmployeeData(row){
    if(confirm("Are you sure? You want to Download loans assignedto employee!")){
      this.appService.getAssignedLoanDetailsEmp(row.id)
      .subscribe(
        (data: any) => {
          if (data.status) {
            this.loansAssignedToEmployee = data.assignedLoanToEmp
            // console.log(this.assignedLoanToEmp)
            this.excelService.exportAsExcelFile(this.loansAssignedToEmployee, row.username+' Loans');
          }
        });
    }
  }

  get f() { 
    return this.empListForm.controls;
   }

  filterEmp(){
    const employeeFilterValue = this.f.employeeFilterValue.value.toLowerCase()
    let filteredDataTemp = []
    filteredDataTemp = this.filteredRows.filter(function(d) {
      return (d.name.toString().toLowerCase().indexOf(employeeFilterValue) !== -1 || d.bucket.toString().toLowerCase().indexOf(employeeFilterValue) !== -1) || !employeeFilterValue;
    });
    this.rows = filteredDataTemp;
  }
}
