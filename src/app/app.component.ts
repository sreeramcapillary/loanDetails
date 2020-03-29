import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from './helpers/services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'loanRecovery';

  constructor( private route: ActivatedRoute, private router: Router, private appService: AppService) {
  }

  ngOnInit(){

    setInterval(() => {
      var date1, date2;  
  
      date1 = new Date( localStorage.getItem('loggedInTimeStamp') );
      console.log(date1);
  
      date2 = new Date();
      console.log(date2);
  
      var res = Math.abs(date1 - date2) / 1000;

      var minutes = Math.floor(res / 60) % 60;
      console.log("Difference (Minutes): "+minutes);  

      if(minutes >= 20){ 
        this.appService.logoutAction(localStorage.getItem('userId'))
        .subscribe(
        (data:any) => {
          localStorage.clear();
          this.router.navigateByUrl('/login');
        });
      }

    }, 1000*60);

      // var date1, date2;  
  
      // date1 = new Date( localStorage.getItem('loggedInTimeStamp') );
      // console.log(date1);
  
      // date2 = new Date();
      // console.log(date2);
  
      // var res = Math.abs(date1 - date2) / 1000;
      
      
      // // // get total days between two dates
      // // var days = Math.floor(res / 86400);
      // // console.log("<br>Difference (Days): "+days);                        
      
      // // // get hours        
      // // var hours = Math.floor(res / 3600) % 24;        
      // // console.log("<br>Difference (Hours): "+hours);  
      
      // // get minutes
      // var minutes = Math.floor(res / 60) % 60;
      // console.log("Difference (Minutes): "+minutes);  
  
      // // // get seconds
      // // var seconds = res % 60;
      // // console.log("<br>Difference (Seconds): "+seconds);
  }
}