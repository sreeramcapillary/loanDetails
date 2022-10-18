import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
declare var $;
import { AppService } from '../../../helpers/services/app.service';
const URL = 'http://localhost:3000/uploadFile';

@Component({
  selector: 'app-viewloandetails',
  templateUrl: './viewloandetails.component.html',
  styleUrls: ['./viewloandetails.component.scss']
})
export class ViewloandetailsComponent implements OnInit {
  userType: string;
  cutomerDetials: string;
  loanStatus: any;
  selectForm: FormGroup;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'files'});
  filename: any;
  old_status: any;

  constructor(private router: Router,private appService: AppService,private formBuilder: FormBuilder) { 
   
   this.userType = localStorage.getItem("usertype");
    if(this.userType != '0'){
      this.router.navigateByUrl('/login');
    }  
  }

  ngOnInit() {
    this.cutomerDetials = JSON.parse(localStorage.getItem("customerData"))
   // console.log(this.cutomerDetials["current_status"])
    this.getLoanStatus()
    this.selectForm = this.formBuilder.group({
      status: ['', Validators.required], 
      comment: ['']
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         if(response){
           this.filename = response;
          alert('File uploaded successfully');
         }
     };

     this.selectForm.patchValue({    
      "status": this.cutomerDetials['current_status'],
      "comment": this.cutomerDetials['comments']
      });
  }
  get f() { 
    return this.selectForm.controls;
   }
  clickSide(val){
    if(val == 'cdetails'){
      this.router.navigate(['/cutomerloandetails']);

    }
  }
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
  getLoanStatus(){
    this.appService.loanStatus()
    .subscribe(
      (data: any) => {
        if (data.status) { 
          // console.log(data.loanStatus)
           this.loanStatus = data.loanStatus
           
        }
      });
  }

  submitDetails(){
    if(this.cutomerDetials['old_status'] != ''){
      this.old_status = this.cutomerDetials['current_status']
    }else{
      this.old_status = ''
    }
    var data={
      loan_log_Id:this.cutomerDetials['Id'],
      current_Status : this.f.status.value,
      old_Status : this.old_status,
      document : this.filename,
      comment : this.f.comment.value,
    }
    this.appService.updateLoanDetails(data)
    .subscribe(
      (data: any) => {
        if (data.status) { 
        //   console.log(data.loanStatus)
            alert("Loan Details updated Successfully")
            this.router.navigate(['/cutomerloandetails']);

          }
      });
  }
  
}
