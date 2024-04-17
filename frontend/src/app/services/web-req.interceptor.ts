import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Helper } from '../helpers/helper';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {
    private readonly helper: Helper = new Helper();
    constructor(private authService: AuthService,
        private toastr: ToastrService,
        public translate: TranslateService,) { }

    refreshingAccessToken: boolean = false;

    accessTokenRefreshed: Subject<any> = new Subject();

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        // Handle the request
        // request = this.addAuthHeader(request);

        // // call next() and handle the response
        // return next.handle(request).pipe(
        //     catchError((error: HttpErrorResponse) => {
        //         console.log(error);

        //         if (error.status === 401) {
        //             request = this.addAuthHeader(request);
        //             return next.handle(request);
        //             // // 401 error so we are unauthorized

        //             // // refresh the access token
        //             // return this.refreshAccessToken()
        //             //     .pipe(
        //             //         switchMap(() => {
        //             //             request = this.addAuthHeader(request);
        //             //             return next.handle(request);
        //             //         }),
        //             //         catchError((err: any) => {
        //             //             console.log(err);
        //             //             this.authService.logout();
        //             //             return empty();
        //             //         })
        //             //     )
        //         }

        //         return throwError(error);
        //     })
        // )

        const idToken = localStorage.getItem("accessToken");

        if (idToken) {
            const cloned = request.clone({
                headers: request.headers.set("Authorization", idToken)
            });

            if (!this.helper.isExpireToken()) {
                this.helper.showWarning(this.toastr, this.helper.getMessage(this.translate, "MESSAGE.TOKEN_EXPIRESIN", 0));
                this.authService.logout();
            }

            return next.handle(cloned);
        }
        else {
            return next.handle(request);
        }
    }

    refreshAccessToken() {
        // if (this.refreshingAccessToken) {
        return new Observable(observer => {
            this.accessTokenRefreshed.subscribe(() => {
                // this code will run when the access token has been refreshed
                observer.next();
                observer.complete();
            })
        })
        //}
        // } else {
        //     this.refreshingAccessToken = true;
        //     // we want to call a method in the auth service to send a request to refresh the access token
        //     return this.authService.getNewAccessToken().pipe(
        //         tap(() => {
        //             console.log("Access Token Refreshed!");
        //             this.refreshingAccessToken = false;
        //             this.accessTokenRefreshed.next(null);
        //         })
        //     )
        // }

    }

    addAuthHeader(request: HttpRequest<any>) {
        // get the access token
        const token = this.authService.getAccessToken();

        if (token) {
            // append the access token to the request header
            return request.clone({
                // setHeaders: {
                //     'x-access-token': token,
                // }
                headers: request.headers.set("Authorization", token)
            })
        }
        return request;
    }

}
