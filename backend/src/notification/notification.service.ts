import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, Like, UpdateResult } from 'typeorm';
import { NotificationAgencyDto } from './dto/notification-agency.dto';
import { NotificationDto } from './dto/notification.dto';
import { NotificationAgency } from './entities/notification-agency.entity';
import { Notification } from './entities/notification.entity';
import { NotificationAgencyRepository } from './repository/notification-agency.repository';
import { NotificationRepository } from './repository/notification.repository';
import { AgencyService } from '../agency/agency.service';
import moment from 'moment';

@Injectable()
export class NotificationService {
  constructor(
    public readonly notifyRepo: NotificationRepository,
    public readonly notifyAgencyRepo: NotificationAgencyRepository,
    private readonly agencyService: AgencyService,
  ) { }

  async getAll(agencyId?: number, isAdmin?: boolean): Promise<any> {
    const stockerId = await this.agencyService.getAgencyIdOfStocker();
    let sql = this.notifyRepo
      .createQueryBuilder('n')
      .select('n')
      .addSelect('GROUP_CONCAT(DISTINCT na.agency_id SEPARATOR ", ") as agencyList')
      .innerJoin(NotificationAgency, 'na', 'na.notification_id = n.id');

    if (agencyId && !isAdmin && agencyId !== stockerId) {
      sql = sql.where('na.agency_id = :agencyId', { agencyId })
        .andWhere('n.isPublished IS TRUE');
    }

    let query = await sql.groupBy('n.id')
      .orderBy("DATE_FORMAT(n.updated_date, '%H:%i %d/%M/%y')", 'ASC')
      .getRawMany();
    const res: NotificationDto[] = [];
    query = query.reverse();
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
      item.notificationType = x.n_notification_type;
      item.orderId = x.n_order_id;
      item.updatedDate = x.n_updated_date;
      item.statusOrder = x.n_status_order;
      res.push(item);
    });

    const res2: NotificationAgencyDto[] = [];
    let sql2 = this.notifyAgencyRepo.createQueryBuilder('na');
    if (agencyId && !isAdmin) {
      sql2 = sql2.where('na.agency_id = :agencyId', { agencyId });
    }
    const query2 = await sql2.getRawMany();

    query2.forEach(el => {
      const item = new NotificationAgencyDto();
      item.id = el.na_id;
      item.agencyId = el.na_agency_id;
      item.notificationId = el.na_notification_id;
      item.isViewed = el.na_is_viewed === 1 ? true : false,
        res2.push(item);
    });

    return { notifyList: res, notifyAgencyList: res2 };
  }

  async create(createDto: NotificationDto): Promise<Notification | any> {
    const notify = this.mappingNoyify(createDto);
    const notifyEntity = await this.notifyRepo.save(notify);
    const notifyAgency: NotificationAgency[] = [];
    createDto.agencyList.forEach(x => {
      notifyAgency.push({
        id: 0,
        agencyId: x,
        notificationId: notifyEntity.id,
        isViewed: false,
      });
    });
    await this.notifyAgencyRepo.save(notifyAgency);
    return notifyEntity;
  }

  async uploadFile(id: number, file: { path, filename, mimetype }): Promise<Notification | any> {
    const res = await this.notifyRepo.createQueryBuilder()
      .update(Notification)
      .set({ filePath: file.path, fileName: file.filename, mimeType: file.mimetype })
      .where("id = :id", { id })
      .execute();
    if (res.affected > 0) {
      return { statusCode: 200 };
    }
    return { statusCode: 400 };
  }

  async update(modifyDto: NotificationDto): Promise<UpdateResult> {
    const notify = this.mappingNoyify(modifyDto);
    const update = await this.notifyRepo.update(modifyDto.id, notify);

    await this.notifyAgencyRepo.createQueryBuilder()
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
    await this.notifyAgencyRepo.save(notifyAgency);
    return update;
  }

  async delete(id: number): Promise<DeleteResult> {
    if (id === 0) {
      await this.notifyAgencyRepo.createQueryBuilder().delete().execute();
      return await this.notifyRepo.createQueryBuilder().delete().execute();
    } else {
      await this.notifyAgencyRepo.createQueryBuilder()
        .delete()
        .where("notification_id = :notifyId", { notifyId: id })
        .execute();
      return await this.notifyRepo.delete(id);
    }
  }

  async deleteMany(ids: number[]): Promise<DeleteResult> {
    await this.notifyAgencyRepo.createQueryBuilder()
      .delete()
      .where("notification_id IN (:notifyId)", { notifyId: ids })
      .execute();
    return await this.notifyRepo.delete(ids);
  }

  private mappingNoyify(modifyDto: NotificationDto): Notification {
    const notify = new Notification();
    notify.contents = modifyDto.contents;
    notify.fileName = modifyDto.fileName;
    notify.note = modifyDto.note;
    notify.isPublished = modifyDto.isPublished;
    notify.createdDate = modifyDto.createdDate;
    notify.mimeType = modifyDto.mimeType ? modifyDto.mimeType : '';
    notify.filePath = modifyDto.filePath ? modifyDto.filePath : '';
    notify.sender = modifyDto.sender;
    notify.notificationType = modifyDto.notificationType;
    notify.updatedDate = moment(new Date).format('HH:mm DD/MM/YYYY');
    notify.orderId = modifyDto.orderId;
    notify.statusOrder = modifyDto.statusOrder;
    return notify;
  }

  async getFileById(id: number) {
    const row = await this.notifyRepo.findOne({
      where: { id }
    });
    if (!row) {
      throw new NotFoundException();
    }
    return row;
  }

  async getBadgeNumber(agencyId?: number): Promise<any[]> {
    let sql = this.notifyRepo
      .createQueryBuilder('n')
      .select('COUNT(n.id) as count')
      .addSelect('na.agency_id as agencyId')
      .innerJoin(NotificationAgency, 'na', 'na.notification_id = n.id')
      .where('na.is_viewed IS FALSE')
      .groupBy('na.agency_id');

    if (agencyId > 1) {
      sql = sql.andWhere('na.agency_id = :agencyId', { agencyId })
        .andWhere('n.isPublished IS TRUE');

      sql = sql.andWhere('n.sender <> :agencyId', { agencyId });
    }

    let query = await sql.getRawMany();
    return query;
  }

  async updateIsView(body: NotificationAgencyDto) {
    return await this.notifyAgencyRepo.createQueryBuilder()
      .update(NotificationAgency)
      .set({ isViewed: body.isViewed })
      .where("notification_id = :notificationId", { notificationId: body.notificationId })
      .andWhere('agency_id = :agencyId', { agencyId: body.agencyId })
      .execute();
  }

  async updateNotifyOrder(body: NotificationDto) {
    const ind1 = body.contents.indexOf('[');
    const ind2 = body.contents.indexOf(']');
    const approvedNumber = body.contents.substring(ind1 + 1, ind2);
    let notify = null;
    if (approvedNumber.length > 0) {
      notify = await this.notifyRepo.find({
        contents: Like(`%${approvedNumber}%`)
      });

    } else {
      notify = await this.notifyRepo.find({
        orderId: body.orderId
      });
    }

    if (notify.length > 0) {
      body.id = notify[0].id;
    }

    let sql = this.notifyRepo.createQueryBuilder()
      .update(Notification)
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
        body.createdDate = moment(new Date).format('HH:mm DD/MM/YYYY');
        body.updatedDate = body.createdDate;
        return await this.create(body);
      }
      sql = sql.where("order_id = :orderId", { orderId: body.orderId });
    } else {

    }

    return await sql.execute();
  }

  async modifyNotifyReport(body: NotificationDto, key: string) {
    const notify = new Notification();
    notify.contents = body.contents;
    notify.fileName = body.fileName;
    notify.note = body.note;
    notify.isPublished = body.isPublished;
    notify.mimeType = body.mimeType ? body.mimeType : '';
    notify.filePath = body.filePath ? body.filePath : '';

    notify.sender = body.sender;
    notify.notificationType = body.notificationType;
    notify.updatedDate = body.updatedDate;
    notify.orderId = body.orderId;
    notify.statusOrder = body.statusOrder;
    notify.reportId = body.reportId;

    if (key === 'CREATE') {
      notify.createdDate = moment(new Date).format('HH:mm:ss DD/MM/YYYY');
      await this.notifyRepo.save(notify);
      const adminId = await this.agencyService.getAgencyIdOfAdmin();
      const notifyAgency: NotificationAgency = {
        id: 0,
        agencyId: adminId,
        notificationId: notify.id,
        isViewed: false,
      };
      await this.notifyAgencyRepo.save(notifyAgency);
    } else {
      const notifyEntity = await this.notifyRepo.getOne(notify.reportId);
      await this.notifyRepo.update(notifyEntity.id, notify);
    }
  }

}

