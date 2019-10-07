import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API,BaseURL } from '../../constants/app-apiurl-constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})

export class AppService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
  constructor(private http: HttpClient) { 
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
    }
    login(username: string, password: string) {
        var body= {
            "username":username,
            "password":password
        }
        return this.http.post(BaseURL.url+'login',body,{
         //  headers: new HttpHeaders().set('Authorization', "Basic " + btoa(username + ":"+password))
        }).pipe(map(data => {
                if (data['success'] == true) {
                    localStorage.setItem('currentUser', JSON.stringify(data['success']));
                    this.currentUserSubject.next(data['success']);
                }

                return data;
            }));
    
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
    registerEmployee(data){
      return this.http.post(BaseURL.url+'registerEmployee',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getEmp(){
      return this.http.get(BaseURL.url+'getAllEmpList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    postFile(file){
      const formData: FormData = new FormData();
     formData.append('uploads', file, file.name);
      return this.http.post(BaseURL.url+'upload',formData, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/x-www-form-urlencoded")
      });

    }
    getAllLoanDetailsList(){
      return this.http.get(BaseURL.url+'getAllLoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    xlupload(loand){
      var loan = {
        loanDetails:loand.data,
        filename:loand.filename
      }
      return this.http.post(BaseURL.url+'insertExcel',loan, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    assignLoan(data){
      return this.http.post(BaseURL.url+'assignLoanList',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getAllAssinedLoanDetailsList(){
      return this.http.get(BaseURL.url+'getAllALoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getAssignedLoanDetailsEmp(emp){
      var body = {
        'empId' : emp
      }
      return this.http.post(BaseURL.url+'getLoanListByEmp', body,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    loanStatus(){
      return this.http.get(BaseURL.url+'getLoanStatus', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    updateLoanDetails(data){
      return this.http.post(BaseURL.url+'updateLoan', data,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    bucketList(){
      return this.http.get(BaseURL.url+'getBucketList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    laguageList(){
      return this.http.get(BaseURL.url+'getAllLanguage', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
    updateLoanData(data){
      var ldata={
        "loanupdateData":data
      }
      return this.http.post(BaseURL.url+'updateLoanDetails',ldata ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('store_current_user_token')).set('Content-Type', "application/json")
      });
    }
}
