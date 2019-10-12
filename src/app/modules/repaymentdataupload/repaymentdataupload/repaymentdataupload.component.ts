import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
declare var $;
const URL = 'http://localhost:3000/uploadExcel';
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
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router, private appService: AppService, public fb: FormBuilder) { }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (response) {
        this.repaumentdata = JSON.parse(response);
        if (this.repaumentdata) {
          this.appService.repaymentupload(this.repaumentdata.data).subscribe(
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

    }
  }
}
