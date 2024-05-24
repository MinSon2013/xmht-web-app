import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';
import { CONFIG } from '../common/config';
import { Helper } from '../helpers/helper';

@Injectable()
export class RoutesService {
    readonly url: string = CONFIG.URL.ORDERS.ORDER;
    readonly url1: string = CONFIG.URL.ORDERS.SEARCH;
    readonly url2: string = CONFIG.URL.ORDERS.SEARCH_DEATILS;
    readonly url3: string = CONFIG.URL.ORDERS.FILTER;
    readonly helper = new Helper();

    constructor(private http: WebRequestService) { }

    getOrderList(): Observable<any> {
        return this.http
            .get(this.url + `/${this.helper.getUserId()}`)
            .pipe(catchError(this.errorHandler));
    }

    getFilterList(): Observable<any> {
        return this.http.get(this.url3 + `/${this.helper.getUserId()}`);
    }

    getDistrictList(): Observable<any> {
        return this.http.get(CONFIG.URL.DISTRICT);
    }

    getUserDistrictList(): Observable<any> {
        const userId = this.helper.getUserId();
        return this.http.get('users/district' + `/${userId}`);
    }

    getUserList(): Observable<any> {
        const userId = this.helper.getUserId();
        return this.http.get(CONFIG.URL.USER + `/${userId}`);
    }

    getAgencyList(): Observable<any> {
        const agencyId = this.helper.getAgencyId();
        return this.http.get(CONFIG.URL.AGENCY + `/${agencyId}`);
    }

    getStoreList(): Observable<any> {
        const userId = this.helper.getUserId();
        const agencyId = this.helper.getAgencyId();
        return this.http.get(CONFIG.URL.STORE + `/${userId}/${agencyId}`);
    }

    getReportList(): Observable<any> {
        const userId = this.helper.getUserId();
        return this.http.get(CONFIG.URL.REPORT + `/${userId}`);
    }

    // secondPOSTCallToAPI(): Observable<any> {
    //     return this.http
    //         .get('https://jsonplaceholder.typicode.com/todos/2')
    //         .pipe(catchError(this.errorHandler));
    // }

    // thirdPOSTCallToAPI(): Observable<any> {
    //     return this.http
    //         .get('https://jsonplaceholder.typicode.com/todos/3')
    //         .pipe(catchError(this.errorHandler));
    // }

    // fourthPOSTCallToAPI(): Observable<any> {
    //     return this.http
    //         .get('https://jsonplaceholder.typicode.com/todos/4')
    //         .pipe(catchError(this.errorHandler));
    // }

    // invoicePOSTCallToAPI(): Observable<any> {
    //     return this.http
    //         .get('https://jsonplaceholder.typicode.com/todos/5')
    //         .pipe(catchError(this.errorHandler));
    // }

    // sixthPOSTCallToAPI(): Observable<any> {
    //     return this.http
    //         .get('https://jsonplaceholder.typicode.com/todos/6')
    //         .pipe(catchError(this.errorHandler));
    // }

    errorHandler(error: any) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            //Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            //alert('Please contact an administrator')
        }
        return throwError(() => new Error('test'));
    }
}
