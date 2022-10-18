import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import {Md5} from 'ts-md5/dist/md5';
import { AppService } from '../../helpers/services/app.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [ AppService ]
})
export class LoginComponent implements OnInit {
  fPassword: boolean;
  title: string;
  loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    pwdPattern = '^(?=.*\d)(?=.*[a-z])(?!.*\s).{6,12}$';
    currentTimeStamp:any
  hashPassword:any;
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService) { 
      if (this.appService.currentUserValue) { 
       this.router.navigate(['/']);
       }
    }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
  });

  // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.fPassword = false;
    this.title = "Administrator login"
  }
  get f() { 
    return this.loginForm.controls;
   }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }
    this.loading = true;
    this.hashPassword = Md5.hashStr(this.f.password.value)
   // console.log(this.hashPassword)
      this.appService.login(this.f.username.value, this.hashPassword)
        .subscribe(
      (data:any) => {
        this.loading = false;
     //  console.log(data.status);
        if(data.status == true){
          localStorage.setItem('we4u_current_user_token', btoa(this.f.username.value + ":"+this.f.password.value));
        //  console.log(true)
        if(data.userDetails != ''){
          // data.userDetails.map(d =>{
            localStorage.setItem("usertype",data.userDetails[0].usertype);
            localStorage.setItem("userId",data.userDetails[0].id);

            if(data.userDetails[0].usertype == 1 || data.userDetails[0].usertype == 2 || data.userDetails[0].usertype == 3){
              this.router.navigateByUrl('/');

            }else{
              this.currentTimeStamp = new Date();
              localStorage.setItem("empName",data.userDetails[0].name);
              localStorage.setItem("empId",data.userDetails[0].username);
              localStorage.setItem("bucket",data.userDetails[0].bucket);
              this.router.navigateByUrl('/cutomerloandetails');
            }

            if(data.userDetails[0].usertype == 2 || data.userDetails[0].usertype == 0){
              localStorage.setItem("loggedInTimeStamp", this.currentTimeStamp);
            }

            if(data.userDetails[0].usertype == 2){
              localStorage.setItem("leadBucket", data.userDetails[0].bucket);
            }
          // })
        }
        }else{
          alert("Invalid Credentials");
        }
      });
    }

}
