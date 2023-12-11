import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  contents: string;

  @Column({ name: 'short_contents', length: 100 })
  shortContents: string;

  @Column({ type: 'text' })
  note: string;

  @Column({ name: 'is_published', default: false, type: 'tinyint' })
  isPublished: boolean;

  @Column({ name: 'created_date' })
  createdDate: string;

  @Column({ name: 'filename' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'sender', default: 0, type: 'tinyint' })
  sender: number;

  @Column({ name: 'notification_type', default: 0, type: 'tinyint' })
  notificationType: number;

  @Column({ name: 'updated_date' })
  updatedDate: string;

  @Column({ name: 'order_id', default: 0 })
  orderId: number;
}