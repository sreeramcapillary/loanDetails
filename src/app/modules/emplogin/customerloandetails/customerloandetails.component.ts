import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';

declare var $;
@Component({
  selector: 'app-customerloandetails',
  templateUrl: './customerloandetails.component.html',
  styleUrls: ['./customerloandetails.component.scss']
})
export class CustomerloandetailsComponent implements OnInit {
  userType: string;
  rows= [];
  empId: string;

  constructor(private router: Router,private appService: AppService) { 
    
    this.userType = localStorage.getItem("usertype");
    this.empId = localStorage.getItem("userId");
    if(this.userType != '0'){
      this.router.navigateByUrl('/login');
    } 
    this.getAllLoanDetails()
  }

  ngOnInit() {
    
  }
  getAllLoanDetails(){
    this.appService.getAssignedLoanDetailsEmp(this.empId)
    .subscribe(
      (data: any) => {
        if (data.status) { 
          this.rows = data.assignedLoanToEmp;
          console.log(this.rows)
        }
      });
  }
  clickSide(val){
    if(val == 'cdetails'){
      this.router.navigate(['/cutomerloandetails']);

    }
  }
  viewDeials(row){
    console.log(row)
    localStorage.setItem('customerData',JSON.stringify(row))
    this.router.navigate(['/cutomerloandetails/viewdetails']);
  }
  
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }

}
