import { Component, OnInit,ViewChild } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import {Md5} from 'ts-md5/dist/md5';
declare var $;

@Component({
  selector: 'app-empregistation',
  templateUrl: './empregistation.component.html',
  styleUrls: ['./empregistation.component.scss']
})
export class EmpregistationComponent implements OnInit {
  registerForm: FormGroup;
  emailPattern = '^[a-zA-Z]+[a-zA-Z0-9._]+@[a-zA-Z]+\\.[a-zA-Z.]{2,6}$';
  submitted: boolean;
  loading: boolean;
  autoPassword: string | Int32Array;
  userType: string;

  
  constructor(public fb: FormBuilder, private router: Router,private appService: AppService) {
   
    this.userType = localStorage.getItem("usertype");
    if(this.userType != '1'){
      this.router.navigateByUrl('/login');
    } 
   }


  ngOnInit() {
    this.registerForm = this.fb.group({
      name: [null, Validators.required],
      username: [null, Validators.required],
      email:[null, [Validators.required,Validators.pattern(this.emailPattern)]],
      mobile:[null,[Validators.required]],
      language:[null,[Validators.required]]
    });
  }
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  get f() { 
    return this.registerForm.controls;
   }
  registerEmp(){
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }
    this.autoPassword = Md5.hashStr(this.f.username.value+'@123')
    var data = {
      "name":this.f.name.value,
      "username":this.f.username.value,
      "email":this.f.email.value,
      "password": this.autoPassword,
      "mobile":this.f.mobile.value,
      "language":this.f.language.value
    }
    this.loading = true;
      this.appService.registerEmployee(data)
        .subscribe(
      (data:any) => {
        this.loading = false;
       console.log(data.status);
        if(data.status == true){
         // localStorage.setItem('current_user_token', btoa(this.f.username.value + ":"+this.f.password.value));
        //  console.log(true)
         this.router.navigateByUrl('/emp-list');
        }else{
          alert("Invalid Credentials");
        }
      });
  }
  clickSide(val){
    if(val == 'elist'){
      this.router.navigate(['/emp-list']);

    }else if(val == 'xlupload'){
      this.router.navigate(['/xl-upload']);

    }else if(val == 'aloan'){
      this.router.navigate(['/assignLoanList']);

    }
  }
}
