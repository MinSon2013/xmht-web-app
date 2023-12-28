import { Injectable } from "@angular/core";
import { CONFIG } from "../common/config";
import { WebRequestService } from "./web-request.service";
import { Helper } from "../helpers/helper";
import { Reports } from "../models/report";

@Injectable({ providedIn: 'root' })
export class ReportService {
    readonly url: string = CONFIG.URL.REPORT;
    readonly helper = new Helper();

    constructor(
        private webrequestService: WebRequestService,
    ) { }

    getReportList() {
        const userId = this.helper.getUserId();
        // const agencyId = this.helper.getAgencyId();
        return this.webrequestService.get(this.url + `/${userId}`);
    }

    create(obj: Reports) {
        const payload = {
            storeId: obj.storeId,
            agencyId: obj.agencyId,
            districtId: obj.districtId,
            provinceId: obj.provinceId,
            storeInformation: obj.storeInformation,
            reportContent: obj.reportContent,
            otherStoreName: obj.otherStoreName,
            attachFile: obj.attachFile,
            filePath: obj.filePath,
            note: obj.note,
            userId: obj.userId,
            fullName: this.helper.getFullName(),
            updatedByUserId: this.helper.getUserId(),
        };
        return this.webrequestService.post(this.url, payload);
    }

    update(obj: Reports) {
        const payload = {
            id: obj.id,
            storeId: obj.storeId,
            agencyId: obj.agencyId,
            districtId: obj.districtId,
            provinceId: obj.provinceId,
            storeInformation: obj.storeInformation,
            reportContent: obj.reportContent,
            otherStoreName: obj.otherStoreName,
            attachFile: obj.attachFile,
            filePath: obj.filePath,
            note: obj.note,
            userId: obj.userId,
            fullName: this.helper.getFullName(),
            updatedByUserId: this.helper.getUserId(),
        };
        return this.webrequestService.put(this.url, payload);
    }

    delete(id: number) {
        return this.webrequestService.delete(this.url + `/${id}`);
    }

    uploadFile(obj: any) {
        return this.webrequestService.upload(CONFIG.URL.REPORTS + `/upload?reportId=${obj.id.toString()}`, obj);
    }

    downloadFile(id: number) {
        return this.webrequestService.download(CONFIG.URL.REPORTS + `/download?reportId=${id.toString()}`);
    }

    search(districtId: number, date: string) {
        const payload = {
            date,
            agencyId: this.helper.getAgencyId(),
            userId: this.helper.getUserId(),
            districtId,
        };
        return this.webrequestService.post(this.url + `/search`, payload);
    }
}