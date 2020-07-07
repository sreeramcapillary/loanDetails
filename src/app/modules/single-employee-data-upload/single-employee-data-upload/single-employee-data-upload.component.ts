import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

declare var $;
// const URL = 'http://localhost:3000/uploadExcel'; // Local
const URL = 'http://148.72.212.163/backend/uploadExcel'; // Live

@Component({
  selector: 'app-single-employee-data-upload',
  templateUrl: './single-employee-data-upload.component.html',
  styleUrls: ['./single-employee-data-upload.component.scss']
})
export class SingleEmployeeDataUploadComponent implements OnInit {
  fileData: File = null;
  fileToUpload: File;
  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'leadExcel' });
  xluploaddata: any;
  emplist: any[];
  loanDetails: any[];
  bucketList: any;
  languageList: any;
  usersWithKnownLanguages: any[];
  newDataForm: FormGroup;
  batchStatus : any;
  empList: any

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, public fb: FormBuilder) {
  }

  ngOnInit() {
    this.appService.changeActiveTab("singleempdataupload")

    this.getAllEmp()

    this.newDataForm = this.fb.group({
      employee : []
    });
    this.getUsersWithKnownLanguages()
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (response) {
        this.xluploaddata = JSON.parse(response);
        if (this.xluploaddata) {
          // console.log("employee", this.newDataForm.value.employee)
          this.appService.singleDataUpload(this.xluploaddata, this.newDataForm.value.employee).subscribe(
            (data: any) => {
              if (data.status) {
                alert('File uploaded successfully');
                this.router.navigate(['/assignLoanList'])
              }
            });
        }
      }
    };
  }
  getAllBucket() {
    this.appService.bucketList()
      .subscribe(
        (data: any) => {
          this.bucketList = data.bucketList
        });
  }
  getAllLanguage() {
    this.appService.laguageList()
      .subscribe(
        (data: any) => {
          this.languageList = data.languageList
        });
  }
  inactiveCurrentBatch(){
    this.appService.inactiveCurrentBatch()
    .subscribe(
      (data: any) => {
      });
  }
  getUsersWithKnownLanguages(){
    this.appService.usersWithKnownLanguages()
      .subscribe(
        (data: any) => {
          this.emplist = data.languageList
        });
  }
  getAllEmp(){
    this.appService.getActiveEmp()
    .subscribe(
      (data: any) => {
        if (data.status) {
          this.empList=data.userDetails;
        }
      });
  }
  togglemenu() {
    $("#wrapper").toggleClass("toggled");

  }
}
