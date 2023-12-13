import { Injectable } from "@angular/core";
import { CONFIG } from "../common/config";
import { WebRequestService } from "./web-request.service";
import { District } from "../models/district";

@Injectable({ providedIn: 'root' })
export class DistrictService {
    readonly url: string = CONFIG.URL.DISTRICT;

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getDistrictList() {
        return this.webrequestService.get(this.url);
    }

    create(obj: District) {
        const payload = {
            name: obj.name,
            provinceId: obj.provinceId,
            userId: obj.userId
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: District) {
        const payload = {
            id: obj.id,
            name: obj.name,
            provinceId: obj.provinceId,
            userId: obj.userId
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }
}