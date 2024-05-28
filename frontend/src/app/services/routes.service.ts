import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';
import { CONFIG } from '../common/config';
import { Helper } from '../helpers/helper';
import { SearchDetailsOrder } from '../models/search';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class RoutesService {
    readonly helper = new Helper();

    constructor(private http: WebRequestService) { }

    getOrderList(take: number, skip: number): Observable<any> {
        let params = new HttpParams();
        params = params.append("userId", this.helper.getUserId());
        params = params.append("take", take);
        params = params.append("skip", skip);
        return this.http
            .getWithParams(CONFIG.URL.ORDERS.ORDER + "/list/", params)
            .pipe(catchError(this.errorHandler));
    }

    getFilterList(): Observable<any> {
        return this.http.get(CONFIG.URL.ORDERS.FILTER + `/${this.helper.getUserId()}`);
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
        return this.http.post(CONFIG.URL.ORDERS.SEARCH_DEATILS, payload);
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

    getProductList(): Observable<any> {
        return this.http.get(CONFIG.URL.PRODUCT);
    }

    errorHandler(error: any) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            //Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(() => new Error('test'));
    }
}
