import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API,BaseURL } from '../../constants/app-apiurl-constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';
@Injectable({
  providedIn: 'root'
})

export class AppService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
    private tab = new BehaviorSubject(localStorage.getItem('activeTab'));
    activeTab = this.tab.asObservable();
  constructor(private http: HttpClient) { 
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  changeActiveTab(data) {
    this.tab.next(data)
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
                if (data['status'] == true) {
                    localStorage.setItem('currentUser', JSON.stringify(data['status']));
                    this.currentUserSubject.next(data['status']);
                }

                return data;
            }));
    
    }

    logout() {
        // remove user from local storage to log user out
        this.logoutAction(localStorage.getItem('userId'))
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
    registerEmployee(data){
      return this.http.post(BaseURL.url+'registerEmployee',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getEmp(){
      return this.http.get(BaseURL.url+'getAllEmpList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getActiveEmp(){
      return this.http.get(BaseURL.url+'getAllActiveEmpList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    postFile(file){
      const formData: FormData = new FormData();
     formData.append('uploads', file, file.name);
      return this.http.post(BaseURL.url+'upload',formData, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/x-www-form-urlencoded")
      });

    }
    getAllLoanDetailsList(){
      return this.http.get(BaseURL.url+'getAllLoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getAssignedLoanDetailsList(){
      return this.http.get(BaseURL.url+'getAssignedLoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getUnAssignedLoanDetailsList(){
      return this.http.get(BaseURL.url+'getUnAssignedLoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getUnAssignedLoanDetailsListForExport(){
      return this.http.get(BaseURL.url+'getUnAssignedLoanDetailsListForExport', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getFilteredLoanDetailsList(){
      return this.http.get(BaseURL.url+'getFilteredLoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    xlupload(loand, client){
      var loan = {
        loanDetails:loand.data,
        filename:loand.filename
      }
      let endPoint = ""
      if(client == "LoanFront"){
        endPoint = "insertExcel"
      }else{
        endPoint = "insertExcelRedCarpet"
      }
      return this.http.post(BaseURL.url+''+endPoint,loan, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    singleDataUpload(loand, empId){
      var loan = {
        loanDetails:loand.data,
        filename:loand.filename,
        employeeId:empId
      }
      return this.http.post(BaseURL.url+'uploadSingleEmployeeDetails',loan, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    assignLoan(data){
      return this.http.post(BaseURL.url+'assignLoanList',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    filterLoan(data){
      return this.http.post(BaseURL.url+'filterLoanList',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    unassignLoan(data){
      return this.http.post(BaseURL.url+'unassignLoanList',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getAllAssinedLoanDetailsList(){
      return this.http.get(BaseURL.url+'getAllALoanDetailsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getAssignedLoanDetailsEmp(emp){
      var body = {
        'empId' : emp
      }
      return this.http.post(BaseURL.url+'getLoanListByEmp', body,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getAssignedLoanDetailsEmpByDate(emp, date){
      var body = {
        'empId' : emp,
        'date'  : date
      }
      return this.http.post(BaseURL.url+'getLoanListByEmpByDate', body,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getLoanPastStatus(loanId){
      var body = {
        'loanId' : loanId
      }
      return this.http.post(BaseURL.url+'getLoanPastStatus', body,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    loanStatus(){
      return this.http.get(BaseURL.url+'getLoanStatus', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    updateLoanDetails(data){
      return this.http.post(BaseURL.url+'updateLoan', data,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    bucketList(){
      return this.http.get(BaseURL.url+'getBucketList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    stateList(){
      return this.http.get(BaseURL.url+'getStateList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    inactiveCurrentBatch(){
      return this.http.get(BaseURL.url+'inactiveCurrentBatch', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    laguageList(){
      return this.http.get(BaseURL.url+'getAllLanguage', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    usersWithKnownLanguages(){
      return this.http.get(BaseURL.url+'getUsersWithKnownLanguages', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    usersWithKnownLanguagesOfTeam(data){
      var teamData={
        "id":data
      }
      return this.http.post(BaseURL.url+'getUsersWithKnownLanguagesOfTeam',teamData ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    updateLoanData(data){
      var ldata={
        "loanupdateData":data
      }
      return this.http.post(BaseURL.url+'updateLoanDetails',ldata ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    oldxlupload(data){
      var ldata={
        "loanupdateData":data
      }
      return this.http.post(BaseURL.url+'updateOldLoanDetails',ldata ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    repaymentupload(data, selectedDate){
      var ldata={
        "repymentData":data,
        "selectedDate":selectedDate
      }
      return this.http.post(BaseURL.url+'updateRepaymentStatus',ldata ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getReports(fromDate, toDate, batch){
      var body = {
        'fromDate' : fromDate,
        'toDate' : toDate,
        'batch' : batch
      }
      return this.http.post(BaseURL.url+'getDayReport', body, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    getAttendance(date){
      var body = {
        'date' : date
      }
      return this.http.post(BaseURL.url+'getDayAttendance', body, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    getAttendancePresentData(date){
      var body = {
        'date' : date
      }
      return this.http.post(BaseURL.url+'getAttendancePresentData', body, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    getAttendanceAbsentData(date){
      var body = {
        'date' : date
      }
      return this.http.post(BaseURL.url+'getAttendanceAbsentData', body, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    editEmployee(data){
      return this.http.post(BaseURL.url+'updateEmployee',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    deActivateEmployee(id){
      var data={
        "empid":id
      }
      return this.http.post(BaseURL.url+'deActivateEmployee',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    deActivateEmployeeWithoutRemovingLoans(id){
      var data={
        "empid":id
      }
      return this.http.post(BaseURL.url+'deActivateEmployeeWithoutUnassigning',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    activateEmployee(id){
      var data={
        "empid":id
      }
      return this.http.post(BaseURL.url+'activateEmployee',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getCurrentDetailedReportsDataForExcel(){
      return this.http.get(BaseURL.url+'getCurrentDetailedReportsDataForExcel', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    getEmployeeLanguages(id){
      var data={
        "empid":id
      }
      return this.http.post(BaseURL.url+'getEmployeeLanguages',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    getEmpListByBucket(bucket){
      var body = {
        'bucketId' : bucket
      }
      return this.http.post(BaseURL.url+'getEmpListByBucket', body,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    registerTeamLead(data){
      return this.http.post(BaseURL.url+'registerTeamLead',data, {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    getActiveLeads(){
      return this.http.get(BaseURL.url+'getAllActiveLeadsList', {
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    getLeadEmployees(id){
      var data={
        "leadId":id
      }
      return this.http.post(BaseURL.url+'getLeadEmployees',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    editLead(data){
      return this.http.post(BaseURL.url+'updateLead',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    deActivateLead(id){
      var data={
        "leadId":id
      }
      return this.http.post(BaseURL.url+'deActivateLead',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }
    activateLead(id){
      var data={
        "leadId":id
      }
      return this.http.post(BaseURL.url+'activateLead',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    logoutAction(id){
      var data={
        "id":id
      }
      return this.http.post(BaseURL.url+'logoutAction',data ,{
        headers: new HttpHeaders().set('Authorization', "Basic " + localStorage.getItem('we4u_current_user_token')).set('Content-Type', "application/json")
      });
    }

    sendOtp(number){
      var data={
        "phone_number":number
      }
      return this.http.post('http://3.7.145.175:8080/collection/login',data ,{
        headers: new HttpHeaders().set('accept', "application/json").set('Content-Type', "application/json")
      });
    }

    validateOtp(number, otp){
      var data={ "mobile_number": number, "otp": otp}
      return this.http.post('http://3.7.145.175:8080/collection/validate_mobile_otp',data ,{
        headers: new HttpHeaders().set('accept', "application/json").set('Content-Type', "application/json")
      });
    }

    downloadLoanData(token){
      return this.http.get('http://3.7.145.175:8080/collection/get-external-agency', {
        headers: new HttpHeaders().set('accept', "application/json").set('token', token)
      });
    }
}
