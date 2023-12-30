import { Injectable } from '@angular/core';
import { CONFIG } from '../common/config';
import { WebRequestService } from './web-request.service';
import { Helper } from '../helpers/helper';

@Injectable({ providedIn: 'root' })
export class UserService {
    readonly url: string = CONFIG.URL.USER;
    private readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getUserList() {
        const userId = this.helper.getUserId();
        return this.webrequestService.get(this.url + `/${userId}`);
    }

    create(obj: any) {
        const payload = {
            userName: obj.userName,
            password: obj.password,
            isAdmin: false,
            role: obj.role,
            districtId: obj.districtId,
            fullName: obj.fullName,
            updatedByUserId: new Helper().getUserId(),
        };
        return this.webrequestService.post(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    changePassword(payload: any) {
        return this.webrequestService.put(this.url + '/changepassword', payload);
    }

    update(obj: any) {
        const payload = {
            id: obj.id,
            role: obj.role,
            districtId: obj.districtId,
            fullName: obj.fullName,
            password: obj.password,
            updatedByUserId: new Helper().getUserId(),
        };
        return this.webrequestService.put(this.url, payload);
    }
}