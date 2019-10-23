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
  selector: 'app-olddataupload',
  templateUrl: './olddataupload.component.html',
  styleUrls: ['./olddataupload.component.scss']
})
export class OlddatauploadComponent implements OnInit {
  fileData: File = null;
  fileToUpload: File;
  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'leadExcel' });
  olduploaddata: any;
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, public fb: FormBuilder) { }

  ngOnInit() {
    this.appService.changeActiveTab("oldxlupload")

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
     // console.log(response)
      if (response) {
        this.olduploaddata = JSON.parse(response);
        //console.log(this.olduploaddata)

        if (this.olduploaddata) {
          this.appService.oldxlupload(this.olduploaddata.data).subscribe(
            (data: any) => {
              if (data.status) {
                alert('File updated successfully');
              }
            })
        }
      }
    }
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

  togglemenu(){
    $("#wrapper").toggleClass("toggled");
  }
}
