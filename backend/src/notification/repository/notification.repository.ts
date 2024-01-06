import { EntityRepository, Like, Repository, UpdateResult } from 'typeorm'
import { NotificationDTO } from '../dto/notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationAgency } from '../entities/notification-agency.entity';
import { NotFoundException } from '@nestjs/common';
import { NotificationAgencyRepository } from './notification-agency.repository';
import { Helper } from '../../shared/helper';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
    private readonly helper = new Helper();

    async getAll(agencyId: number): Promise<any> {
        let sql = this.createQueryBuilder('n')
            .select('n')
            .addSelect('GROUP_CONCAT(DISTINCT na.agency_id SEPARATOR ", ") as agencyList')
            .innerJoin(NotificationAgency, 'na', 'na.notification_id = n.id');

        if (agencyId !== 0) {
            sql = sql.where('na.agency_id = :agencyId', { agencyId })
                .andWhere('n.isPublished IS TRUE');
        }

        let query = await sql.groupBy('n.id')
            .orderBy("DATE_FORMAT(n.updated_date, '%H:%i %d/%M/%y')", 'ASC')
            .getRawMany();
        const res: NotificationDTO[] = [];
        query = query.reverse();
        query.forEach(x => {
            const item = new NotificationDTO();
            item.id = x.n_id;
            item.orderId = x.n_order_id;
            item.reportId = x.n_report_id;
            item.contents = x.n_contents;
            item.fileName = x.n_filename;
            item.filePath = x.n_file_path;
            item.mimeType = x.n_mime_type;
            item.notificationType = x.n_notification_type;
            item.note = x.n_note;
            item.isPublished = x.n_is_published;
            item.agencyList = x.agencyList.split(",").map(Number);;
            item.createdDate = x.n_created_date;
            item.sender = x.n_sender;
            item.updatedDate = x.n_updated_date;
            item.statusOrder = x.n_status_order;
            res.push(item);
        });

        return res;
    }

    async getByReportId(reportId: number): Promise<Notification> {
        return await this.findOne({
            where: {
                reportId
            },
        })
    }

    async createNotification(createDto: NotificationDTO, notifyAgencyRepo: NotificationAgencyRepository): Promise<Notification | any> {
        const notifyEntity = this.mappingNoyify(createDto);
        const notify = await this.save(notifyEntity);
        const notifyAgency: NotificationAgency[] = [];
        createDto.agencyList.forEach(x => {
            notifyAgency.push({
                id: 0,
                agencyId: x,
                notificationId: notify.id,
                isViewed: false,
            });
        });
        await notifyAgencyRepo.save(notifyAgency);
        return notify;
    }

    async updateNotification(modifyDto: NotificationDTO, notifyAgencyRepo: NotificationAgencyRepository): Promise<UpdateResult> {
        const notify = this.mappingNoyify(modifyDto);
        const update = await this.update(modifyDto.id, notify);

        await notifyAgencyRepo.createQueryBuilder()
            .delete()
            .where("notification_id = :notifyId", { notifyId: modifyDto.id })
            .execute();

        const notifyAgency: NotificationAgency[] = [];
        modifyDto.agencyList.forEach(agencyId => {
            notifyAgency.push({
                id: 0,
                agencyId,
                notificationId: modifyDto.id,
                isViewed: modifyDto.isViewed,
            });
        });
        await notifyAgencyRepo.save(notifyAgency);
        return update;
    }

    async uploadFile(id: number, file: { path, filename, mimetype }): Promise<Notification | any> {
        const res = await this.createQueryBuilder()
            .update()
            .set({ filePath: file.path, fileName: file.filename, mimeType: file.mimetype })
            .where("id = :id", { id })
            .execute();
        if (res.affected > 0) {
            return { statusCode: 200 };
        }
        return { statusCode: 400 };
    }

    public mappingNoyify(modifyDto: NotificationDTO): Notification {
        const notify = new Notification();
        notify.contents = modifyDto.contents;
        notify.fileName = modifyDto.fileName;
        notify.note = modifyDto.note;
        notify.isPublished = modifyDto.isPublished;
        if (!modifyDto.id) {
            notify.createdDate = this.helper.getUpdateDate(2);
        }
        notify.mimeType = modifyDto.mimeType ? modifyDto.mimeType : '';
        notify.filePath = modifyDto.filePath ? modifyDto.filePath : '';
        notify.sender = modifyDto.sender;
        notify.notificationType = modifyDto.notificationType;
        notify.updatedDate = this.helper.getUpdateDate(2);
        notify.orderId = modifyDto.orderId;
        notify.statusOrder = modifyDto.statusOrder;
        notify.reportId = modifyDto.reportId;
        return notify;
    }

    async getFileById(id: number) {
        const row = await this.findOne({
            where: { id }
        });
        if (!row) {
            throw new NotFoundException();
        }
        return row;
    }

    async getBadgeNumber(agencyId: number): Promise<any[]> {
        let sql = this.createQueryBuilder('n')
            .select('COUNT(n.id) as count')
            .addSelect('na.agency_id as agencyId')
            .innerJoin(NotificationAgency, 'na', 'na.notification_id = n.id')
            .where('na.is_viewed IS FALSE')
            .groupBy('na.agency_id');

        if (agencyId !== 0) {
            sql = sql.andWhere('na.agency_id = :agencyId', { agencyId })
                .andWhere('n.isPublished IS TRUE');

            sql = sql.andWhere('n.sender <> :agencyId', { agencyId });
        }

        let query = await sql.getRawMany();
        return query;
    }

    async updateNotifyOrder(body: NotificationDTO) {
        const ind1 = body.contents.indexOf('[');
        const ind2 = body.contents.indexOf(']');
        const approvedNumber = body.contents.substring(ind1 + 1, ind2);
        let notify = null;
        if (approvedNumber.length > 0 && approvedNumber !== '-') {
            notify = await this.find({
                contents: Like(`%${approvedNumber}%`),
            });

        } else {
            notify = await this.find({
                orderId: body.orderId
            });
        }

        if (notify.length > 0) {
            notify = notify.reverse();
            body.id = notify[0].id;
        }

        let sql = this.createQueryBuilder()
            .update()
            .set({
                updatedDate: body.updatedDate,
                statusOrder: body.statusOrder,
                orderId: body.orderId,
                contents: body.contents,
                sender: body.sender,
            });

        if (body.id !== 0 && body.id !== undefined) {
            sql = sql.where("id = :notifyId", { notifyId: body.id });

        } else if (body.orderId !== 0 && body.orderId !== undefined) {
            if (approvedNumber.length === 0) {
                body.createdDate = this.helper.getUpdateDate(2);
                body.updatedDate = this.helper.getUpdateDate(2);
                return await this.create(body);
            }
            sql = sql.where("order_id = :orderId", { orderId: body.orderId });
        } else {

        }

        return await sql.execute();
    }
}