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
            // name: obj.name,
            // province: obj.province,
            // userId: obj.userId,
            // updateDate: obj.updateDate
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: Store) {
        const payload = {
            // id: obj.id,
            // name: obj.name,
            // province: obj.province,
            // userId: obj.userId,
            // updateDate: obj.updateDate
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }
}