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
            fullName: obj.fullName,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            email: obj.email,
            accountName: obj.accountName,
            password: obj.password,
            contract: obj.contract
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: Agency) {
        const payload = {
            id: obj.id,
            fullName: obj.fullName,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            email: obj.email,
            accountName: obj.accountName,
            password: obj.password,
            contract: obj.contract,
            userId: obj.userId
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    changePasswordAdmin(password: string) {
        return this.webrequestService.post(CONFIG.URL.USER + '/change/password/admin', {password});
    }
}