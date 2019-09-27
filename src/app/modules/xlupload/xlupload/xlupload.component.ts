import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../helpers/services/app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { HttpClient } from '@angular/common/http';

declare var $;
const URL = 'http://localhost:3000/uploadExcel';

@Component({
  selector: 'app-xlupload',
  templateUrl: './xlupload.component.html',
  styleUrls: ['./xlupload.component.scss']
})
export class XluploadComponent implements OnInit {
  fileData: File = null;
  fileToUpload: File;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'leadExcel'});
  xluploaddata: any;

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,private appService: AppService) {
     }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('FileUpload:uploaded:',JSON.parse(response));
         if(response){
           this.xluploaddata = JSON.parse(response);
           this.appService.xlupload(this.xluploaddata.data).subscribe(
            (data: any) => {
              if (data.status) {
                this.router.navigate(['/assignLoanList'])
              }
            });
         }
         alert('File uploaded successfully');
     };
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
  togglemenu(){
    $("#wrapper").toggleClass("toggled");

  }
}
