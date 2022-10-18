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
      // setInterval(() => {
      //   if(localStorage.getItem('usertype') == "2" || localStorage.getItem('usertype') == "0"){
      //     var date1, date2;  
      
      //     date1 = new Date( localStorage.getItem('loggedInTimeStamp') );
      //     console.log(date1);
      
      //     date2 = new Date();
      //     console.log(date2);
      
      //     var res = Math.abs(date1 - date2) / 1000;
    
      //     var minutes = Math.floor(res / 60) % 60;
      //     console.log("Difference (Minutes): "+minutes);  
    
      //     if(minutes >= 20){ 
      //       this.appService.logoutAction(localStorage.getItem('userId'))
      //       .subscribe(
      //       (data:any) => {
      //         localStorage.clear();
      //         this.router.navigateByUrl('/login');
      //       });
      //     }
      //   }
      // }, 1000*60);
  }
}