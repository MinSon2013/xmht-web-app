import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', default: 0 })
  orderId: number;

  @Column({ name: 'report_id', default: 0 })
  reportId: number;

  @Column({ type: 'text' })
  contents: string;

  @Column({ name: 'filename' })
  fileName: string;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'notification_type', default: 0, type: 'tinyint' })
  notificationType: number;

  @Column({ type: 'text' })
  note: string;

  @Column({ name: 'is_published', default: false, type: 'tinyint' })
  isPublished: boolean;

  @Column({ name: 'created_date', length: 20 })
  createdDate: string;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'status_order', length: 100 })
  statusOrder: string;

  @Column({ name: 'sender', default: 0, type: 'tinyint' })
  sender: number;
}