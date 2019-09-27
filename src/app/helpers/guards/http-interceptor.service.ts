import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  growlData: { severity: string; summary: any; detail: string; };
  constructor() { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //  this.spinner.show();
    return next.handle(request).pipe(
        tap(res => {
          if (res instanceof HttpResponse) {
        // this.spinner.hide();
        }
        }),
        catchError(err => {
          //  this.spinner.hide();
            throw err;
        })
      );
  }
}
