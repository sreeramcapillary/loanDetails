import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
declare var $;

@Component({
  selector: 'app-emplist',
  templateUrl: './emplist.component.html',
  styleUrls: ['./emplist.component.scss']
})
export class EmplistComponent implements OnInit {

  title = 'angular-datatables';
  rows = [];
  userType: string;
  constructor( private route: ActivatedRoute,
    private router: Router,private appService: AppService) { 
     
      this.userType = localStorage.getItem("usertype");
      if(this.userType != '1'){
        this.router.navigateByUrl('/login');
      } 
    }


  ngOnInit() {
    this.appService.changeActiveTab("elist")

    this.getAllEmp();
  }

  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getAllEmp(){
    this.appService.getActiveEmp()
    .subscribe(
      (data: any) => {
        if (data.status) {
          //.log(data.userDetails)
          this.rows = data.userDetails;
        }
      });
  }
  registerEmp(){
    //console.log("emp")
    localStorage.setItem("editemp",JSON.stringify(''));

    this.router.navigate(['emp-list','emp-registation']);

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
}
