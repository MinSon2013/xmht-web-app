import { Injectable } from "@angular/core";
import { CONFIG } from "../common/config";
import { WebRequestService } from "./web-request.service";
import { Store } from "../models/store";
import { Helper } from "../helpers/helper";

@Injectable({ providedIn: 'root' })
export class StoreService {
    readonly url: string = CONFIG.URL.STORE;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getStoreList() {
        const userId = this.helper.getUserId();
        const agencyId = this.helper.getAgencyId();
        return this.webrequestService.get(this.url + `/${userId}/${agencyId}`);
    }

    create(obj: Store) {
        const payload = {
            storeName: obj.storeName,
            agencyId: obj.agencyId,
            districtId: obj.districtId,
            provinceId: obj.provinceId,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            userId: obj.userId,
            updatedByUserId: this.helper.getUserId(),
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: Store) {
        const payload = {
            id: obj.id,
            storeName: obj.storeName,
            agencyId: obj.agencyId,
            districtId: obj.districtId,
            provinceId: obj.provinceId,
            address: obj.address,
            phone: obj.phone,
            note: obj.note,
            userId: obj.userId,
            updatedByUserId: this.helper.getUserId(),
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }
}