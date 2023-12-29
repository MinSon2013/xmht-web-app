import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Reports } from '../entities/report.entity';
import { ModifyReportDTO } from '../dto/modify-report.dto';
import { NotificationService } from '../../notification/notification.service';
import { NotificationDTO } from '../../notification/dto/notification.dto';
import { Helper } from '../../shared/helper';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {
    private NOTIFY_TYPE_GENERAL = 1;
    private readonly helper = new Helper();

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

    async createReport(modifyReportDto: ModifyReportDTO, notificationService: NotificationService): Promise<Reports> {
        const reportEntity = this.mappingReport(modifyReportDto, 'CREATE');
        const report = await this.save(reportEntity);
        modifyReportDto.id = report.id;
        let contents = `${modifyReportDto.fullName} đã tạo báo cáo mới`;
        await this.createNotify(modifyReportDto, contents, notificationService, 'CREATE');
        return report;
    }

    async updateReport(modifyReportDto: ModifyReportDTO, notificationService: NotificationService): Promise<UpdateResult> {
        const report = this.mappingReport(modifyReportDto, 'UPDATE');
        const updateReport = await this.update(modifyReportDto.id, report);
        let contents = `${modifyReportDto.fullName} đã cập nhật báo cáo`;
        await this.createNotify(modifyReportDto, contents, notificationService, 'UPDATE');
        return updateReport;
    }

    async deleteReport(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private mappingReport(modifyReportDto: ModifyReportDTO, key: string): Reports {
        const report = new Reports();
        report.agencyId = modifyReportDto.agencyId;
        report.districtId = modifyReportDto.districtId;
        report.provinceId = modifyReportDto.provinceId;
        report.storeId = modifyReportDto.storeId;
        report.storeInformation = modifyReportDto.storeInformation;
        report.reportContent = modifyReportDto.reportContent;
        report.otherStoreName = modifyReportDto.otherStoreName;
        report.note = modifyReportDto.note;
        if (key === 'CREATE') {
            report.createDate = this.helper.getUpdateDate(1);
        }
        report.updateDate = this.helper.getUpdateDate(1);
        report.updatedByUserId = modifyReportDto.updatedByUserId;
        return report;
    }

    async createNotify(modifyReportDto: ModifyReportDTO, contents: string, notificationService: NotificationService, k: string) {
        const notifyDto = new NotificationDTO();
        notifyDto.contents = contents;
        notifyDto.isPublished = true;
        notifyDto.agencyList = [];
        notifyDto.note = '';
        notifyDto.fileName = '';
        notifyDto.filePath = '';
        notifyDto.mimeType = '';
        notifyDto.orderId = 0;
        notifyDto.sender = modifyReportDto.updatedByUserId;
        notifyDto.notificationType = this.NOTIFY_TYPE_GENERAL;
        notifyDto.statusOrder = '';
        notifyDto.reportId = modifyReportDto.id;
        return await notificationService.createNotifyForReport(notifyDto, k);
    }
}