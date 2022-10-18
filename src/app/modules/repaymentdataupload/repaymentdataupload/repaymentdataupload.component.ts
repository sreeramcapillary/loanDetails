import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
declare var $;
// const URL = 'http://localhost:3000/uploadExcel'; //Local
const URL = 'http://148.72.212.163/backend/uploadExcel'; // Live
@Component({
  selector: 'app-repaymentdataupload',
  templateUrl: './repaymentdataupload.component.html',
  styleUrls: ['./repaymentdataupload.component.scss']
})
export class RepaymentdatauploadComponent implements OnInit {
  fileData: File = null;
  fileToUpload: File;
  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'leadExcel' });
  xluploaddata: any;
  repaumentdata: any;
  public dateTime1: Date;
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, public fb: FormBuilder) { }

  ngOnInit() {
    this.appService.changeActiveTab("repaymentdataupload")

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (response) {
        this.repaumentdata = JSON.parse(response);
        if (this.repaumentdata) {
          var date = new Date(this.dateTime1);
          var month = ("0" + (date.getMonth() + 1)).slice(-2)
          var fulldate = ("0" + date.getDate()).slice(-2)
          var year = date.getFullYear()
          let selectedDate = year+"-"+month+"-"+fulldate
          if(selectedDate == "NaN-aN-aN"){
            var today = new Date();
            var dd = String(("0" + today.getDate()).slice(-2)).padStart(2, '0');
            var mm = String(("0" + (today.getMonth() + 1)).slice(-2)).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            selectedDate = yyyy + '-' + mm + '-' + dd;
          }
          this.appService.repaymentupload(this.repaumentdata.data,selectedDate).subscribe(
            (data: any) => {
              if (data.status) {
                alert('File updated successfully');
              }
            })
        }
      }
    }
  }

  togglemenu(){
    $("#wrapper").toggleClass("toggled");
  }
  
}
