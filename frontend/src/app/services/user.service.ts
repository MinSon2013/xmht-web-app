import { Injectable } from '@angular/core';
import { CONFIG } from '../common/config';
import { WebRequestService } from './web-request.service';
import { Helper } from '../helpers/helper';
import { UserRO } from '../models/ro/user.ro';
import { Observable, map } from 'rxjs';

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
            // token: obj.token,
            // expiresAt: obj.expiresAt,
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

    // getUserRoleList() {
    //     // return this.webrequestService.get(CONFIG.URL.USER_ROLE);
    //     return this.webrequestService.get(this.url);
    // }

    // createUserRole(obj: any) {
    //     const payload = {
    //         userName: obj.userName,
    //         password: obj.password,
    //         isAdmin: false,
    //         role: obj.role,
    //         districtId: obj.districtId,
    //         fullName: obj.fullName,
    //         updatedByUserId: new Helper().getUserId(),
    //     };
    //     return this.webrequestService.post(this.url, payload);
    //     // return this.webrequestService.post(CONFIG.URL.USER_ROLE, payload);
    // }

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
        // return this.webrequestService.put(CONFIG.URL.USER_ROLE, payload);
    }

    // deleteUserRole(id: number) {
    //     return this.webrequestService.delete(this.url + `/${id}`);
    //     // return this.webrequestService.delete(CONFIG.URL.USER_ROLE + `/${id}`);
    // }
}