import { Injectable } from '@angular/core';
import { CONFIG } from '../common/config';
import { WebRequestService } from './web-request.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    readonly url: string = CONFIG.URL.USER;

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getUserList(){
        return this.webrequestService.get(this.url);
    }

    create(obj: any) {
        const payload = {
            username: obj.username,
            password: obj.password,
            isAdmin: obj.isAdmin,
            token: obj.token,
            expiresAt: obj.expiresAt
        };
        return this.webrequestService.post(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    changePassword(payload: any) {
        return this.webrequestService.put(this.url + '/changepassword', payload);
    }
}