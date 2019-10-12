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
    this.getAllEmp();
  }

  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getAllEmp(){
    this.appService.getEmp()
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
 
}
