import { Component, OnInit,ViewChild } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import {Md5} from 'ts-md5/dist/md5';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

declare var $;

@Component({
  selector: 'app-empregistation',
  templateUrl: './empregistation.component.html',
  styleUrls: ['./empregistation.component.scss']
})
export class EmpregistationComponent implements OnInit {
  registerForm: FormGroup;
  emailPattern = '^[a-zA-Z]+[a-zA-Z0-9._]+@[a-zA-Z]+\\.[a-zA-Z.]{2,6}$';
  submitted = false;
  loading: boolean;
  autoPassword: string | Int32Array;
  userType: string;
  bList: any;
  bucketList: any;
  languageList: any;
  languageListAltered: any;
  dropdownSettings: IDropdownSettings = {} ;
  dropdownList: any;
  editEmpVal: string;
  hideLanguage: boolean;
  selectedItems = []

  
  constructor(public fb: FormBuilder, private router: Router,private appService: AppService) {
   
    this.userType = localStorage.getItem("usertype");
    if(this.userType != '1' && this.userType != '3'){
      this.router.navigateByUrl('/login');
    } 
   }


  ngOnInit() {

  //  this.editEmpVal ='';
    this.registerForm = this.fb.group({
      name: [null, Validators.required],
      username: [null, Validators.required],
      password: [null],
      email: [null],
      mobile: [null],
      // email:[null, [Validators.required,Validators.pattern(this.emailPattern)]],
      // mobile:[null,[Validators.required]],
      assignedbucket:[null, Validators.required],
      language:[null,[Validators.required]]
    });
    this.getAllBucket();
    this.getAllLanguage();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'language',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };
    this.editEmpVal = JSON.parse(localStorage.getItem("editemp"));
    console.log(this.editEmpVal)
    if(this.editEmpVal != ''){
      this.hideLanguage = false;
      this.registerForm.patchValue({
        name: this.editEmpVal["name"],
        username:this.editEmpVal["username"],
        email:this.editEmpVal["email"],
        mobile:this.editEmpVal["mobile"],
        assignedbucket:this.editEmpVal["bucket_id"],
        language:[]
      });
      // this.selectedItems = [
      //   { "id" : 1, "language": 'Telugu' }
      // ];
      this.appService.getEmployeeLanguages(this.editEmpVal["id"])
          .subscribe(
        (data:any) => {
          this.loading = false;
        console.log(data);
          if(data.status == true){
            this.selectedItems = data.languages
          }
        });
    }else{
      this.hideLanguage = false;

    }
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
    var data;
    if(this.editEmpVal != ''){
      //Geting list of rows based on selected languages
      let finalLanguages = []
      this.f.language.value.map((language) => {
        this.languageListAltered[language.language].map(lang => {
          finalLanguages.push(lang)
        })
      })
      let pwd
      if(this.f.password.value != null){
        console.log(this.f.password.value)
        pwd = Md5.hashStr(this.f.password.value)
      }else{
        pwd = ''
      }
      data = {
        "id":this.editEmpVal["id"],
        "name":this.f.name.value,
        "username":this.f.username.value,
        "email":this.f.email.value,
        "password": pwd,
        "mobile":this.f.mobile.value,
        "language":finalLanguages,
        "assignedbucket":this.f.assignedbucket.value
      }
      console.log( data)
      this.loading = true;
        this.appService.editEmployee(data)
          .subscribe(
        (data:any) => {
          this.loading = false;
        // console.log(data.status);
          if(data.status == true){
           // localStorage.setItem('current_user_token', btoa(this.f.username.value + ":"+this.f.password.value));
          //  console.log(true)
          alert(data.message)
           this.router.navigateByUrl('/emp-list');

          }else{
            if(data.code = 402){
              var  message = JSON.parse(data.message)
              alert(message.sqlMessage);
            }else{
              alert(data.message)
            }
            }
        });
    }else{
   
    // this.autoPassword = Md5.hashStr(this.f.username.value+'@123')

    //Geting list of rows based on selected languages
    let finalLanguages = []
    this.f.language.value.map((language) => {
      this.languageListAltered[language.language].map(lang => {
        finalLanguages.push(lang)
      })
    })
     data = {
      "name":this.f.name.value,
      "username":this.f.username.value,
      "email":this.f.email.value,
      "password": Md5.hashStr(this.f.password.value),
      "mobile":this.f.mobile.value,
      "language":finalLanguages,
      "assignedbucket":this.f.assignedbucket.value
    }
    console.log( data)
    this.loading = true;
      this.appService.registerEmployee(data)
        .subscribe(
      (data:any) => {
        this.loading = false;
      // console.log(data.status);
        if(data.status == true){
         // localStorage.setItem('current_user_token', btoa(this.f.username.value + ":"+this.f.password.value));
        //  console.log(true)
         this.router.navigateByUrl('/emp-list');
        }else{
          if(data.code = 402){
            var  message = JSON.parse(data.message)
            alert(message.sqlMessage);
          }else{
            alert(data.message)
          }
          }
       
      });
    }
  }
  getAllBucket(){
    this.appService.bucketList()
    .subscribe(
    (data:any) => {
      //console.log(data)
      this.bucketList= data.bucketList
    });
  }
  getAllLanguage(){
    this.appService.laguageList()
    .subscribe(
    (data:any) => {
    //  console.log(data)
     this.languageListAltered = []
     this.languageListAltered["languages"] = []
      this.languageList= data.languageList
      var lList;
      this.dropdownList=[];
      this.languageList.map(data=>{
        //altering the language list
        if(typeof this.languageListAltered[data.name] === 'undefined') {
          this.languageListAltered[data.name] = []
          this.languageListAltered[data.name].push(data)
          //Pushing only unique Languages
          lList = 
          { "id": data.id, 
            "language": data.name
          }
         this.dropdownList.push(lList)
        }else{
          this.languageListAltered[data.name].push(data)
        }
      })
     console.log("altered data list", this.languageListAltered)
     console.log("dropdownlist", this.dropdownList)
    });
  }
  onItemSelect(item: any) {
   //console.log( this.f.language.value)
   // console.log(item);
  }
  onSelectAll(items: any) {
  //  console.log(items);
  }
}
