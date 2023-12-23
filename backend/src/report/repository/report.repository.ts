import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import moment from 'moment';
import { Reports } from '../entities/report.entity';
import { ModifyReportDto } from '../dto/modify-report.dto';
import { NotificationService } from '../../notification/notification.service';
import { NotificationDto } from '../../notification/dto/notification.dto';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {
    private NOTIFY_TYPE_GENERAL = 1;

    constructor() {
        super();
    }

    async getOne(id: number): Promise<Reports> {
        return await this.findOne({
            where: {
                id
            },
        })
    }

    async createReport(modifyReportDto: ModifyReportDto, notificationService: NotificationService): Promise<Reports> {
        const reportEntity = this.mappingReport(modifyReportDto, 'CREATE');
        const report = await this.save(reportEntity);
        modifyReportDto.id = report.id;
        let contents = `${modifyReportDto.accountName} đã tạo báo cáo mới`;
        await this.createNotify(modifyReportDto, contents, notificationService, 'CREATE');
        return report;
    }

    async updateReport(modifyReportDto: ModifyReportDto, notificationService: NotificationService): Promise<UpdateResult> {
        const report = this.mappingReport(modifyReportDto, 'UPDATE');
        const updateReport = await this.update(modifyReportDto.id, report);
        let contents = `${modifyReportDto.accountName} đã cập nhật báo cáo`;
        await this.createNotify(modifyReportDto, contents, notificationService, 'UPDATE');
        return updateReport;
    }

    async deleteReport(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private mappingReport(modifyReportDto: ModifyReportDto, key: string): Reports {
        const report = new Reports();
        report.agencyId = modifyReportDto.agencyId;
        report.districtId = modifyReportDto.districtId;
        report.provinceId = modifyReportDto.provinceId;
        report.storeId = modifyReportDto.storeId;
        report.storeInformation = modifyReportDto.storeInformation;
        report.reportContent = modifyReportDto.reportContent;
        // report.attachFile = modifyReportDto.attachFile;
        // report.filePath = modifyReportDto.filePath;
        report.note = modifyReportDto.note;
        if (key === 'CREATE') {
            report.createDate = moment(new Date).format('HH:mm:ss DD/MM/YYYY');
        }
        report.updateDate = moment(new Date).format('HH:mm:ss DD/MM/YYYY');
        report.userId = modifyReportDto.userId;
        return report;
    }

    async createNotify(modifyReportDto, contents: string, notificationService: NotificationService, k: string) {
        const notifyDto = new NotificationDto();
        notifyDto.contents = contents;
        notifyDto.shortContents = contents;
        notifyDto.isPublished = true;
        notifyDto.agencyList = [];
        notifyDto.note = '';
        notifyDto.fileName = '';
        notifyDto.filePath = '';
        notifyDto.mimeType = '';
        notifyDto.orderId = 0;
        notifyDto.sender = modifyReportDto.userId;
        notifyDto.notificationType = this.NOTIFY_TYPE_GENERAL;
        notifyDto.updatedDate = moment(new Date).format('HH:mm DD/MM/YYYY');
        notifyDto.statusOrder = '';
        notifyDto.reportId = modifyReportDto.id;
        await notificationService.modifyNotifyReport(notifyDto, k);
    }
}