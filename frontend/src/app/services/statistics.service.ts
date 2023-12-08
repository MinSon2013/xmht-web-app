import { CONFIG } from '../common/config';
import { WebRequestService } from './web-request.service';

export class StatisticsService {
    readonly url: string = CONFIG.URL.STATISTICS;

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getInfo() {
        return this.webrequestService.get(this.url);
    }
}