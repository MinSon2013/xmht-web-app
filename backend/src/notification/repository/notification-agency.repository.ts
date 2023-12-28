import { EntityRepository, Repository } from 'typeorm'
import { NotificationAgencyDTO } from '../dto/notification-agency.dto';
import { NotificationAgency } from '../entities/notification-agency.entity';

@EntityRepository(NotificationAgency)
export class NotificationAgencyRepository extends Repository<NotificationAgency> {

    async saveNotifyAgency(notifyAgency: NotificationAgency[]) {
        await this.save(notifyAgency);
    }

    async deleteNotificationAgency(notifyId: number) {
        await this.createQueryBuilder()
            .delete()
            .where("notification_id = :notifyId", { notifyId })
            .execute();
    }

    async updateRead(body: NotificationAgencyDTO) {
        return await this.createQueryBuilder()
            .update(NotificationAgency)
            .set({ isViewed: body.isViewed })
            .where("notification_id = :notificationId", { notificationId: body.notificationId })
            .andWhere('agency_id = :agencyId', { agencyId: body.agencyId })
            .execute();
    }

    async getNotificationAgencyByAgencyId(agencyId: number) {
        const res: NotificationAgencyDTO[] = [];

        let sql = this.createQueryBuilder('na');
        if (agencyId !== 0) {
            sql = sql.where('na.agency_id = :agencyId', { agencyId });
        }
        const query = await sql.getMany();
        query.forEach(el => {
            const item = new NotificationAgencyDTO();
            item.id = el.id;
            item.agencyId = el.agencyId;
            item.notificationId = el.notificationId;
            item.isViewed = el.isViewed;
            res.push(item);
        });

        return res;
    }

    async updateIsView(body: NotificationAgencyDTO) {
        return await this.createQueryBuilder()
            .update()
            .set({ isViewed: body.isViewed })
            .where("notification_id = :notificationId", { notificationId: body.notificationId })
            .andWhere('agency_id = :agencyId', { agencyId: body.agencyId })
            .execute();
    }
}