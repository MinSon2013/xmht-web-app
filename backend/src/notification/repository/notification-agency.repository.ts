import { EntityRepository, Repository } from 'typeorm'
import { NotificationAgencyDto } from '../dto/notification-agency.dto';
import { NotificationAgency } from '../entities/notification-agency.entity';

@EntityRepository(NotificationAgency)
export class NotificationAgencyRepository extends Repository<NotificationAgency> {

    async getAll() {
        await this.find();
    }

    async saveNotifyAgency(notifyAgency: NotificationAgency[]) {
        await this.save(notifyAgency);
    }

    async deleteNotificationAgency(notifyId: number) {
        await this.createQueryBuilder()
            .delete()
            .where("notification_id = :notifyId", { notifyId })
            .execute();
    }

    async updateRead(body: NotificationAgencyDto) {
        return await this.createQueryBuilder()
            .update(NotificationAgency)
            .set({ isViewed: body.isViewed })
            .where("notification_id = :notificationId", { notificationId: body.notificationId })
            .andWhere('agency_id = :agencyId', { agencyId: body.agencyId })
            .execute();
    }
}