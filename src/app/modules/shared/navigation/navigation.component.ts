import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  activeTab: any;
  userRole : any

  constructor(private route: ActivatedRoute,
    private router: Router,private appService: AppService) { }

  ngOnInit() {
    this.appService.activeTab.subscribe(data => {
      console.log(data);
      if(data){
        this.activeTab =data;
      }else{   
         this.activeTab ='elist';
      }
    })
    this.userRole = localStorage.getItem("usertype")
  }
  clickSide(val){
    localStorage.setItem("activeTab",val)
   // this.activeTab =val;
    if(val == 'elist'){
      this.router.navigate(['/emp-list']);

    }else if(val == 'xlupload'){
      this.router.navigate(['/xl-upload']);

    }else if(val == 'aloan'){
      this.router.navigate(['/assignLoanList']);

    }else if(val == 'ualoan'){
      this.router.navigate(['/unassignedLoanList']);
    }else if(val == 'filteredloan'){
      this.router.navigate(['/filteredLoanList']);

    }else if(val == 'oldxlupload'){
      this.router.navigate(['/oldxlupload']);

    }else if(val == 'singleempdataupload'){
      this.router.navigate(['/singleEmployeeDataUpload']);

    }else if(val == 'repaymentdataupload'){
      this.router.navigate(['/repaymentupload']);

    }else if(val == 'reports'){
      this.router.navigate(['/reports']);

    }else if(val == 'leadlist'){
      this.router.navigate(['/lead-list']);

    }
  }
}
