import { Injectable } from '@angular/core';
import { CONFIG } from '../common/config';
import { Agency } from '../models/agency';
import { WebRequestService } from './web-request.service';

@Injectable({ providedIn: 'root' })
export class AgencyService {
    readonly url: string = CONFIG.URL.AGENCY;

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getAgencyList() {
        return this.webrequestService.get(this.url);
    }

    create(obj: Agency) {
        const payload = {
            agencyName: obj.agencyName,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            email: obj.email,
            userName: obj.userName,
            password: obj.password,
            contract: obj.contract,
            role: obj.role,
            updatedByUserId: obj.updatedByUserId,
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: Agency) {
        const payload = {
            id: obj.id,
            agencyName: obj.agencyName,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            email: obj.email,
            userName: obj.userName,
            password: obj.password,
            contract: obj.contract,
            role: obj.role,
            updatedByUserId: obj.updatedByUserId,
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    changePasswordAdmin(password: string) {
        return this.webrequestService.post(CONFIG.URL.USER + '/change/password/admin', { password });
    }
}