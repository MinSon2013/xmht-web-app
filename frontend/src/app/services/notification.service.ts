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
        const isAdmin = this.helper.isAdmin();
        if (isAdmin) {
            return this.webrequestService.get(this.url);
        } else {
            return this.webrequestService.get(this.url + `/${agencyId}/${isAdmin}`);
        }
    }

    getBadgeNumber(agencyId: number): Observable<any> {
        return this.webrequestService.post(this.url + `/badge`, { agencyId });
    }

    create(obj: any): Observable<any> {
        const agencyId = this.helper.getAgencyId();
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
            sender: agencyId,
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: any): Observable<any> {
        const agencyId = this.helper.getAgencyId();
        const payload = {
            id: obj.id,
            agencyList: obj.agencyList,
            contents: obj.contents,
            note: obj.note,
            isPublished: obj.isPublished,
            createdDate: obj.createdDate,
            fileName: obj.fileName,
            isViewed: true,
            sender: agencyId,
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
        return this.webrequestService.upload(this.url + `/upload?notifyId=${obj.id.toString()}`, obj);
    }

    downloadFile(id: number) {
        return this.webrequestService.download(this.url + `/download?notifyId=${id.toString()}`);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    deleteMany(id: number[]) {
        const strId = id.toString();
        const payload = { id };
        return this.webrequestService.deleteAll(this.url + `/deleteall`, payload);
    }
}