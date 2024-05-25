import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';
import { CONFIG } from '../common/config';
import { Helper } from '../helpers/helper';
import { SearchDetailsOrder } from '../models/search';

@Injectable()
export class RoutesService {
    readonly url: string = CONFIG.URL.ORDERS.ORDER;
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

    getOrderDetails(obj: SearchDetailsOrder): Observable<any> {
        const payload = {
            agencyId: obj.agencyId.toString(),
            deliveryId: obj.deliveryId.toString(),
            pickupId: obj.pickupId.toString(),
            licensePlate: obj.licensePlate.trim(),
            driver: obj.driver.trim(),
            receipt: obj.receipt.toString(),
            status: obj.status,
            productId: obj.productId.toString(),
            startDate: obj.startDate,
            endDate: obj.endDate,
            userId: this.helper.getUserId(),
        }
        return this.http.post(this.url2, payload);
    }

    getDistrictList(): Observable<any> {
        return this.http.get(CONFIG.URL.DISTRICT);
    }

    getUserDistrictList(): Observable<any> {
        const userId = this.helper.getUserId();
        return this.http.get(CONFIG.URL.USER + "/" + CONFIG.URL.DISTRICT + `/${userId}`);
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
