import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  rows: any;

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService) { }

  ngOnInit() {
    this.getAllReports()
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
  getAllReports(){
    this.appService.getReports()
    .subscribe(
      (data: any) => {
        if (data.status) {
         // console.log(data.reportData)
          this.rows = data.reportData;
        }
      });
  }
}
