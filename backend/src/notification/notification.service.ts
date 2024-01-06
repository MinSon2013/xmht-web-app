import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { NotificationAgencyDTO } from './dto/notification-agency.dto';
import { NotificationDTO } from './dto/notification.dto';
import { NotificationAgency } from './entities/notification-agency.entity';
import { Notification } from './entities/notification.entity';
import { NotificationAgencyRepository } from './repository/notification-agency.repository';
import { NotificationRepository } from './repository/notification.repository';
import { Helper } from '../shared/helper';
import { UserRepository } from '../user/repository/user.repository';

@Injectable()
export class NotificationService {
  private readonly helper = new Helper();

  constructor(
    public readonly notifyRepo: NotificationRepository,
    public readonly notifyAgencyRepo: NotificationAgencyRepository,
    public readonly userRepo: UserRepository,
  ) { }

  async getAll(agencyId: number): Promise<any> {
    const res1 = await this.notifyRepo.getAll(agencyId);
    const res2 = await this.notifyAgencyRepo.getNotificationAgencyByAgencyId(agencyId);
    const userList = await this.userRepo.getAllUserList();
    res1.forEach(x => {
      const user = userList.find(y => y.id === x.sender);
      if (user) {
        x.confirmName = user.fullName;
      }
    })
    return { notifyList: res1, notifyAgencyList: res2 };
  }

  async create(createDto: NotificationDTO): Promise<Notification | any> {
    return await this.notifyRepo.createNotification(createDto, this.notifyAgencyRepo);
  }

  async update(modifyDto: NotificationDTO): Promise<UpdateResult> {
    return await this.notifyRepo.updateNotification(modifyDto, this.notifyAgencyRepo);
  }

  async uploadFile(id: number, file: { path, filename, mimetype }): Promise<Notification | any> {
    return await this.notifyRepo.uploadFile(id, file);
  }

  async delete(notifyId: number): Promise<DeleteResult> {
    if (notifyId === 0) {
      await this.notifyAgencyRepo.createQueryBuilder().delete().execute();
      return await this.notifyRepo.createQueryBuilder().delete().execute();
    } else {
      await this.notifyAgencyRepo.deleteNotificationAgency(notifyId);
      return await this.notifyRepo.delete(notifyId);
    }
  }

  async deleteMany(ids: number[]): Promise<DeleteResult> {
    await this.notifyAgencyRepo.createQueryBuilder()
      .delete()
      .where("notification_id IN (:notifyId)", { notifyId: ids })
      .execute();
    return await this.notifyRepo.delete(ids);
  }

  async getFileById(id: number) {
    return await this.notifyRepo.getFileById(id);
  }

  async getBadgeNumber(agencyId: number): Promise<any[]> {
    return await this.notifyRepo.getBadgeNumber(agencyId);
  }

  async updateIsView(body: NotificationAgencyDTO) {
    return await this.notifyAgencyRepo.updateIsView(body);
  }

  async updateNotifyOrder(body: NotificationDTO) {
    return await this.notifyRepo.updateNotifyOrder(body);
  }

  async createNotifyForReport(body: NotificationDTO, key: string) {
    const notify = this.notifyRepo.mappingNoyify(body);
    if (key === 'CREATE') {
      notify.createdDate = this.helper.getUpdateDate(2);
      notify.updatedDate = this.helper.getUpdateDate(2);
      const res = await this.notifyRepo.save(notify);
      notify.id = res.id;
      const notifyAgency: NotificationAgency = {
        id: 0,
        agencyId: 0,
        notificationId: notify.id,
        isViewed: false,
      };
      return await this.notifyAgencyRepo.save(notifyAgency);
    } else {
      notify.updatedDate = this.helper.getUpdateDate(2);
      const notifyEntity = await this.notifyRepo.getByReportId(notify.reportId);
      if (notifyEntity) {
        return await this.notifyRepo.update(notifyEntity.id, notify);
      }
      return;
    }
  }
}

