import { Router } from '@angular/router';
import { CONFIG } from '../common/config';
import { WebRequestService } from './web-request.service';
import { BehaviorSubject, catchError, shareReplay, tap, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Helper } from '../helpers/helper';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class LoginService {
    readonly url: string = CONFIG.URL.LOGIN;
    errorSubject: any = new BehaviorSubject<any>(null);
    errorMessage: any = this.errorSubject.asObservable();
    helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
        private router: Router,
        private toastr: ToastrService,
    ) { }

    login(username: string, password: string) {
        return this.webrequestService.login(username, password).pipe(
            shareReplay(),
            tap((response: HttpResponse<any>) => {
                if (response.body.statusCode === HttpStatusCode.Ok) {
                    // Lưu session vào storage
                    localStorage.setItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN, response.body.accessToken ? response.body.accessToken : '1');
                    localStorage.setItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO, JSON.stringify(response.body.loginInfo));
                    localStorage.setItem(CONFIG.LOCAL_STORAGE.DELIVERY_LIST, JSON.stringify(response.body.deliveryList));
                    localStorage.setItem(CONFIG.LOCAL_STORAGE.AGENCY_LIST, JSON.stringify(response.body.agencyList));
                    localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_LIST, JSON.stringify(response.body.productList));
                } else if (response.body.statusCode === HttpStatusCode.Unauthorized) {
                    this.errorSubject.next('Mật khẩu không đúng.');
                    this.helper.showError(this.toastr, 'Mật khẩu không đúng.');
                } else if (response.body.statusCode === HttpStatusCode.NotFound) {
                    this.errorSubject.next('Tên đăng nhập không đúng.');
                    this.helper.showError(this.toastr, 'Tên đăng nhập không đúng.');
                }
            }),
            catchError((err) => {
                if (err.error.statusCode === HttpStatusCode.Unauthorized) {
                    this.errorSubject.next('Mật khẩu không đúng.');
                    this.helper.showError(this.toastr, 'Mật khẩu không đúng.');
                } else if (err.error.statusCode === HttpStatusCode.NotFound) {
                    this.errorSubject.next('Tên đăng nhập không đúng.');
                    this.helper.showError(this.toastr, 'Tên đăng nhập không đúng.');
                }
                return throwError(err);
            })
        )
    }

    isAuthenticated(): boolean {
        if (localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN)) {
            return true;
        } else {
            return false;
        }
    }

    logOut() {
        localStorage.clear();
        this.router.navigate(['']);
    }
}