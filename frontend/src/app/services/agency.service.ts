import { Injectable } from '@angular/core';
import { CONFIG } from '../common/config';
import { Agency } from '../models/agency';
import { WebRequestService } from './web-request.service';
import { Helper } from '../helpers/helper';

@Injectable({ providedIn: 'root' })
export class AgencyService {
    readonly url: string = CONFIG.URL.AGENCY;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getAgencyList() {
        const agencyId = this.helper.getAgencyId();
        return this.webrequestService.get(this.url + `/${agencyId}`);
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
            userId: obj.userId,
            agencyName: obj.agencyName,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            email: obj.email,
            contract: obj.contract,
            updatedByUserId: obj.updatedByUserId,
            password: obj.password,
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number, userId: number) {
        return this.webrequestService.delete(this.url + `/${id}/${userId}`);
    }
}