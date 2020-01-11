import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import {ExcelService} from '../../../helpers/services/excel.service';
declare var $;

@Component({
  selector: 'app-leadlist',
  templateUrl: './leadlist.component.html',
  styleUrls: ['./leadlist.component.scss']
})
export class LeadlistComponent implements OnInit {

  title = 'angular-datatables';
  rows = [];
  userType: string;
  // loansAssignedToEmployee: any = []
  constructor( private route: ActivatedRoute,
    private router: Router,private appService: AppService, private excelService:ExcelService) { 
     
      this.userType = localStorage.getItem("usertype");
      if(this.userType != '1'){
        this.router.navigateByUrl('/login');
      } 
    }


  ngOnInit() {
    this.appService.changeActiveTab("leadlist")
    this.getAllLead();
  }

  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getAllLead(){
    this.appService.getActiveLeads()
    .subscribe(
      (data: any) => {
        if (data.status) {
          //.log(data.userDetails)
          this.rows = data.userDetails;
        }
      });
  }
  registerLead(){
    //console.log("emp")
    localStorage.setItem("editlead",JSON.stringify(''));

    this.router.navigate(['lead-list','lead-registation']);

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

    }else if(val == 'leadlist'){
      this.router.navigate(['/lead-list']);

    }
  }
  editLead(row){
    console.log(row)
    localStorage.setItem("editlead",JSON.stringify(row));
    this.router.navigate(['lead-list','lead-registation']);

  }
  deactivateLead(row){
    var confirmation = confirm("Are you sure? You want to deactivate the Lead!")
    console.log(confirmation)
    if(confirmation){
      this.appService.deActivateLead(row.id)
      .subscribe(
      (data:any) => {
      // console.log(data.status);
        if(data.status == true){
          alert(data.message)
          // this.getAllLead();
          location.reload()
        }else{
            alert(data.message)
          
        }
      });
    }
   
  }
  activateLead(row){
    var confirmation = confirm("Are you sure? You want to activate the Lead!")
    console.log(confirmation)
    if(confirmation){
      this.appService.activateLead(row.id)
      .subscribe(
      (data:any) => {
      // console.log(data.status);
        if(data.status == true){
          alert(data.message)
          this.getAllLead();
        }else{
            alert(data.message)
          
        }
      });
    }
  }
  // downloadLeadData(row){
  //   if(confirm("Are you sure? You want to Download loans assignedto Lead!")){
  //     this.appService.getAssignedLoanDetailsEmp(row.id)
  //     .subscribe(
  //       (data: any) => {
  //         if (data.status) {
  //           this.loansAssignedToEmployee = data.assignedLoanToEmp
  //           // console.log(this.assignedLoanToEmp)
  //           this.excelService.exportAsExcelFile(this.loansAssignedToEmployee, row.username+' Loans');
  //         }
  //       });
  //   }
  // }
}
