import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CONFIG } from '../common/config';
import { Helper } from '../helpers/helper';
import { WebRequestService } from './web-request.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    readonly url: string = CONFIG.URL.NOTIFICATION;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getNotificationList(): Observable<any> {
        const agencyId = this.helper.getAgencyId();
        return this.webrequestService.get(this.url + `/${agencyId}`);
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
}