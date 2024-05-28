import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { CONFIG } from '../common/config';
import { Helper } from '../helpers/helper';
import { WebRequestService } from './web-request.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    readonly url: string = CONFIG.URL.NOTIFICATION;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getNotificationList(take: number, skip: number): Observable<any> {
        // const agencyId = this.helper.getAgencyId();
        // return this.webrequestService.get(this.url + `/${agencyId}`);

        let params = new HttpParams();
        params = params.append("agencyId", this.helper.getAgencyId());
        params = params.append("take", take);
        params = params.append("skip", skip);
        return this.webrequestService
            .getWithParams(this.url + "/list/", params)
            .pipe(catchError(this.errorHandler));
    }

    getNotification(id: number): Observable<any> {
        return this.webrequestService.get(this.url + `/get/${id}`);
    }

    getBadgeNumber(agencyId: number): Observable<any> {
        return this.webrequestService.post(this.url + `/badge`, { agencyId });
    }

    create(obj: any): Observable<any> {
        const payload = {
            agencyList: obj.agencyList,
            contents: obj.contents,
            note: obj.note,
            isPublished: obj.isPublished,
            createdDate: obj.createdDate,
            fileName: obj.fileName,
            filePath: '',
            mimeType: '',
            isViewed: false,
            sender: this.helper.getUserId(),
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: any): Observable<any> {
        const payload = {
            id: obj.id,
            agencyList: obj.agencyList,
            contents: obj.contents,
            note: obj.note,
            isPublished: obj.isPublished,
            createdDate: obj.createdDate,
            fileName: obj.fileName,
            isViewed: true,
            sender: this.helper.getUserId(),
        };
        return this.webrequestService.put(this.url, payload);
    }

    updateStatus(agencyIdList: number[], notificationId: number) {
        const payload = {
            isViewed: true,
            agencyIdList,
            notificationId,
        }
        return this.webrequestService.put(this.url + '/status', payload);
    }

    uploadFile(obj: any) {
        return this.webrequestService.upload(CONFIG.URL.NOTIFICATIONS + `/upload?notifyId=${obj.id.toString()}`, obj);
    }

    downloadFile(id: number) {
        return this.webrequestService.download(CONFIG.URL.NOTIFICATIONS + `/download?notifyId=${id.toString()}`);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    deleteMany(id: number[]) {
        const payload = { id };
        return this.webrequestService.deleteAll(this.url + `/deleteall`, payload);
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
        return throwError(() => new Error('getNotificationList with param {take, skip}'));
    }
}