import { Injectable } from "@angular/core";
import { CONFIG } from "../common/config";
import { WebRequestService } from "./web-request.service";
import { District } from "../models/district";
import { Helper } from "../helpers/helper";

@Injectable({ providedIn: 'root' })
export class DeliveryService {
    readonly url: string = CONFIG.URL.DELIVERY;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getDeliveryList() {
        return this.webrequestService.get(this.url);
    }
}