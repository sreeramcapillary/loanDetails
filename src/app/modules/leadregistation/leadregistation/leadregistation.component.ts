import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { Md5 } from 'ts-md5/dist/md5';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

declare var $;

@Component({
  selector: 'app-leadregistation',
  templateUrl: './leadregistation.component.html',
  styleUrls: ['./leadregistation.component.scss']
})
export class LeadregistationComponent implements OnInit {
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
  dropdownSettings: IDropdownSettings = {};
  dropdownList: any;
  editLeadVal: string;
  hideLanguage: boolean;
  selectedItems = []


  constructor(public fb: FormBuilder, private router: Router, private appService: AppService) {

    this.userType = localStorage.getItem("usertype");
    if (this.userType != '1' && this.userType != '3') {
      this.router.navigateByUrl('/login');
    }
  }


  ngOnInit() {

    //  this.editLeadVal ='';
    this.registerForm = this.fb.group({
      name: [null, Validators.required],
      username: [null, Validators.required],
      password: [null],
      email: [null, [Validators.required, Validators.pattern(this.emailPattern)]],
      mobile: [null, [Validators.required]],
      assignedbucket: [null, Validators.required],
      employees: [null, [Validators.required]]
    });
    this.getAllBucket();
    // this.getAllLanguage();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'employee',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };
    this.editLeadVal = JSON.parse(localStorage.getItem("editlead"));
    console.log(this.editLeadVal)
    if (this.editLeadVal != '') {
      
      this.hideLanguage = false;
      this.registerForm.patchValue({
        name: this.editLeadVal["name"],
        username: this.editLeadVal["username"],
        email: this.editLeadVal["email"],
        mobile: this.editLeadVal["mobile"],
        assignedbucket: this.editLeadVal["bucket_id"],
        employees: []
      });
      this.getEmpListOfBucket()
      // this.selectedItems = [
      //   { "id" : 1, "language": 'Telugu' }
      // ];
      this.appService.getLeadEmployees(this.editLeadVal["id"])
        .subscribe(
          (data: any) => {
            this.loading = false;
            console.log(data);
            if (data.status == true) {
              this.selectedItems = data.employees
            }
          });
    } else {
      this.hideLanguage = false;

    }
  }
  togglemenu() {
    $("#wrapper").toggleClass("toggled");

  }
  get f() {
    return this.registerForm.controls;
  }
  registerLead() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    var data;
    if (this.editLeadVal != '') {
      //Geting list of rows based on selected languages
      let finalEmployees = []
      this.f.employees.value.map((employee) => {
          finalEmployees.push(employee.id)
      })

      let pwd
      if(this.f.password.value != null){
        console.log(this.f.password.value)
        pwd = Md5.hashStr(this.f.password.value)
      }else{
        pwd = ''
      }

      data = {
        "id": this.editLeadVal["id"],
        "name": this.f.name.value,
        "username": this.f.username.value,
        "email": this.f.email.value,
        "password": pwd,
        "mobile": this.f.mobile.value,
        "employees": finalEmployees,
        "assignedbucket": this.f.assignedbucket.value
      }
      console.log(data)
      this.loading = true;
      this.appService.editLead(data)
        .subscribe(
          (data: any) => {
            this.loading = false;
            // console.log(data.status);
            if (data.status == true) {
              // localStorage.setItem('we4u_current_user_token', btoa(this.f.username.value + ":"+this.f.password.value));
              //  console.log(true)
              alert(data.message)
              this.router.navigateByUrl('/lead-list');

            } else {
              if (data.code = 402) {
                var message = JSON.parse(data.message)
                alert(message.sqlMessage);
              } else {
                alert(data.message)
              }
            }
          });
    } else {

      // this.autoPassword = Md5.hashStr(this.f.username.value + '@123')

      //Geting list of rows based on selected employees
      let finalEmployees = []
      this.f.employees.value.map((employee) => {
          finalEmployees.push(employee.id)
      })

      data = {
        "name": this.f.name.value,
        "username": this.f.username.value,
        "email": this.f.email.value,
        "password": Md5.hashStr(this.f.password.value),
        "mobile": this.f.mobile.value,
        "employees": finalEmployees,
        "assignedbucket": this.f.assignedbucket.value
      }
      // console.log(data)
      // return false
      this.loading = true;
      this.appService.registerTeamLead(data)
        .subscribe(
          (data: any) => {
            this.loading = false;
            // console.log(data.status);
            if (data.status == true) {
              // localStorage.setItem('we4u_current_user_token', btoa(this.f.username.value + ":"+this.f.password.value));
              //  console.log(true)
              this.router.navigateByUrl('/lead-list');
            } else {
              if (data.code = 402) {
                var message = JSON.parse(data.message)
                alert(message.sqlMessage);
              } else {
                alert(data.message)
              }
            }

          });
    }
  }

  getEmpListOfBucket() {
    this.appService.getEmpListByBucket(this.f.assignedbucket.value).subscribe((data: any) => {
      // console.log(data)
      var eList;
      this.dropdownList = [];
      data.employees.map(employee => {
        eList =
          {
            "id": employee.id,
            "employee": employee.name
          }
        this.dropdownList.push(eList)
      })
    })
  }

  clickSide(val) {
    if (val == 'elist') {
      this.router.navigate(['/emp-list']);

    } else if (val == 'xlupload') {
      this.router.navigate(['/xl-upload']);

    } else if (val == 'aloan') {
      this.router.navigate(['/assignLoanList']);

    } else if (val == 'oldxlupload') {
      this.router.navigate(['/oldxlupload']);

    } else if (val == 'repaymentdataupload') {
      this.router.navigate(['/repaymentupload']);

    } else if (val == 'reports') {
      this.router.navigate(['/reports']);

    } else if (val == 'leadlist') {
      this.router.navigate(['/lead-list']);

    }
  }
  getAllBucket() {
    this.appService.bucketList()
      .subscribe(
        (data: any) => {
          //console.log(data)
          this.bucketList = data.bucketList
        });
  }
  getAllLanguage() {
    this.appService.laguageList()
      .subscribe(
        (data: any) => {
          //  console.log(data)
          this.languageListAltered = []
          this.languageListAltered["languages"] = []
          this.languageList = data.languageList
          var lList;
          this.dropdownList = [];
          this.languageList.map(data => {
            //altering the language list
            if (typeof this.languageListAltered[data.name] === 'undefined') {
              this.languageListAltered[data.name] = []
              this.languageListAltered[data.name].push(data)
              //Pushing only unique Languages
              lList =
                {
                  "id": data.id,
                  "employee": data.name
                }
              this.dropdownList.push(lList)
            } else {
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
