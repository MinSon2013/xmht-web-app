import { Injectable } from '@angular/core';
import { CONFIG } from '../common/config';
import { Helper } from '../helpers/helper';
import { Product } from '../models/product';
import { WebRequestService } from './web-request.service';
import { Search } from '../models/search';

@Injectable({ providedIn: 'root' })
export class ProductService {
    readonly url: string = CONFIG.URL.PRODUCT;
    readonly url1: string = CONFIG.URL.SUM;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getProductList() {
        return this.webrequestService.get(this.url);
    }

    getSumProductOrderList(obj: Search) {
        const payload = {
            orderId: Number(obj.orderId),
            startDate: obj.startDate,
            endDate: obj.endDate,
            agencyId: Number(obj.agencyId),
            productId: Number(obj.productId),
            status: Number(obj.status),
            userId: this.helper.getAgencyId(),
        };
        return this.webrequestService.post(this.url1, payload);
    }

    getOne(id: number) {
        return this.webrequestService.post(this.url + `/${id}`);
    }

    create(obj: Product) {
        const payload = {
            name: obj.name,
            quantity: obj.quantity,
            price: obj.price,
            note: obj.note
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: Product) {
        const payload = {
            id: obj.id,
            name: obj.name,
            quantity: obj.quantity,
            price: obj.price,
            note: obj.note
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }
}