import { Injectable } from "@angular/core";
import { CONFIG } from "../common/config";
import { WebRequestService } from "./web-request.service";
import { Store } from "../models/store";

@Injectable({ providedIn: 'root' })
export class StoreService {
    readonly url: string = CONFIG.URL.STORE;

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getStoreList() {
        return this.webrequestService.get(this.url);
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
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }
}