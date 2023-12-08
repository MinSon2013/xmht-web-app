import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification-agency')
export class NotificationAgency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agency_id' })
  agencyId: number;

  @Column({ name: 'notification_id' })
  notificationId: number;

  @Column({ name: 'is_viewed', default: false, type: 'boolean' })
  isViewed: boolean;
}