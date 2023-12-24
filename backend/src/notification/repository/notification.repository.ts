import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { NotificationDto } from '../dto/notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationAgency } from '../entities/notification-agency.entity';
import { NotFoundException } from '@nestjs/common';
import { NotificationAgencyRepository } from './notification-agency.repository';
import { NotificationAgencyDto } from '../dto/notification-agency.dto';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {

    async findAll(): Promise<any> {
        return await this.querySql(0);
    }

    async getAll(agencyId: number): Promise<any> {
        return await this.querySql(agencyId);
    }

    async getOne(reportId: number): Promise<Notification> {
        return await this.findOne({
            where: {
                reportId
            },
        })
    }

    private async querySql(agencyId: number) {
        let sql = this.createQueryBuilder('n')
            .select('n')
            .addSelect('GROUP_CONCAT(DISTINCT na.agency_id SEPARATOR ", ") as agencyList')
            .innerJoin(NotificationAgency, 'na', 'na.notification_id = n.id');

        if (agencyId !== 0) {
            sql = sql.where('na.agency_id = :agencyId', { agencyId });
        }

        let query = await sql.groupBy('n.id')
            .orderBy('n.updated_date', 'DESC')
            .addOrderBy('n.id', 'DESC')
            .getRawMany();
        const res: NotificationDto[] = [];
        query.forEach(x => {
            const item = new NotificationDto();
            item.id = x.n_id;
            item.contents = x.n_contents;
            item.fileName = x.n_filename;
            item.note = x.n_note;
            item.isPublished = x.n_is_published;
            item.agencyList = x.agencyList.split(",").map(Number);;
            item.createdDate = x.n_created_date;
            item.mimeType = x.n_mime_type;
            item.filePath = x.n_file_path;

            item.sender = x.n_sender;
            item.updatedDate = x.n_updated_date;
            item.notificationType = x.n_notification_type;
            item.orderId = x.n_order_id;
            item.statusOrder = x.n_status_order;
            res.push(item);
        });

        const res2: NotificationAgencyDto[] = [];
        const query2 = await this.createQueryBuilder()
            .from(NotificationAgency, 'na')
            .getRawMany();
        query2.forEach(el => {
            const item = new NotificationAgencyDto();
            item.id = el.id;
            item.agencyId = el.agencyId;
            item.notificationId = el.notificationId;
            item.isViewed = el.isViewed;
            res2.push(item);
        });

        return { notify: res, notifyAgency: res2 };
    }

    async createNotification(createDto: NotificationDto,
        notifyAgencyRepo: NotificationAgencyRepository): Promise<Notification | any> {
        const notify = this.mappingNoyify(createDto);
        const notifyEntity = await this.save(notify);
        const notifyAgency: NotificationAgency[] = [];
        createDto.agencyList.forEach(x => {
            notifyAgency.push({
                id: 0,
                agencyId: x,
                notificationId: notifyEntity.id,
                isViewed: false,
            });
        });
        await notifyAgencyRepo.saveNotifyAgency(notifyAgency);
        return notifyEntity;
    }

    async uploadFile(id: number, file: { path, filename, mimetype }): Promise<Notification | any> {
        const res = await this.createQueryBuilder()
            .update(Notification)
            .set({ filePath: file.path, fileName: file.filename, mimeType: file.mimetype })
            .where("id = :id", { id })
            .execute();
        if (res.affected > 0) {
            return { statusCode: 200 };
        }
        return { statusCode: 400 };
    }

    async updateNotification(modifyDto: NotificationDto,
        notifyAgencyRepo: NotificationAgencyRepository): Promise<UpdateResult> {
        const notify = this.mappingNoyify(modifyDto);
        const update = await this.update(modifyDto.id, notify);

        await notifyAgencyRepo.deleteNotificationAgency(modifyDto.id);

        const notifyAgency: NotificationAgency[] = [];
        modifyDto.agencyList.forEach(x => {
            notifyAgency.push({
                id: 0,
                agencyId: x,
                notificationId: modifyDto.id,
                isViewed: modifyDto.isViewed,
            });
        });
        await notifyAgencyRepo.saveNotifyAgency(notifyAgency);
        return update;
    }

    async deleteNotification(id: number, notifyAgencyRepo: NotificationAgencyRepository): Promise<DeleteResult> {
        await notifyAgencyRepo.deleteNotificationAgency(id);
        return await this.delete(id);
    }

    private mappingNoyify(modifyDto: NotificationDto): Notification {
        const notify = new Notification();
        notify.contents = modifyDto.contents;
        notify.fileName = modifyDto.fileName;
        notify.note = modifyDto.note;
        notify.isPublished = modifyDto.isPublished;
        notify.createdDate = modifyDto.createdDate;
        notify.mimeType = modifyDto.mimeType;
        notify.filePath = modifyDto.filePath;
        notify.sender = modifyDto.sender;
        notify.notificationType = modifyDto.notificationType;
        notify.updatedDate = modifyDto.updatedDate;
        notify.orderId = modifyDto.orderId;
        notify.statusOrder = modifyDto.statusOrder;
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

    async getBadgeNumber(agencyId: number): Promise<number> {
        let sql = this.createQueryBuilder('n')
            .select('COUNT(n.id)')
            .where('n.is_viewed IS TRUE');

        if (agencyId !== 0) {
            sql = sql.leftJoin(NotificationAgency, 'na', 'na.notification_id = n.id')
            sql = sql.andWhere('na.agency_id = :agencyId', { agencyId });
        }

        let query = await sql.getCount();

        return Number(query);
    }
}