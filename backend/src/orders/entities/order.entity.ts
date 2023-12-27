import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agency_id' })
  agencyId: number;

  @Column({ name: 'created_date', length: 20 })
  createdDate: string;

  @Column({ name: 'delivery_id' })
  deliveryId: number;

  @Column({ name: 'pickup_id' })
  pickupId: number;

  @Column({ name: 'product_total' })
  productTotal: string;

  @Column()
  transport: number;

  @Column({ name: 'license_plates', length: 12 })
  licensePlates: string;

  @Column({ length: 100 })
  driver: string;

  @Column({ name: 'received_date', length: 12 })
  receivedDate: string;

  @Column()
  status: number;

  @Column({ length: 500 })
  note: string;

  @Column({ length: 200 })
  contract: string;

  products?: any[];

  @Column({ name: 'is_viewed', default: false, type: 'tinyint' })
  isViewed: boolean;

  @Column({ name: 'sender', default: 0, type: 'tinyint' })
  sender: number;

  @Column({ name: 'approved_number', default: 0 })
  approvedNumber: number;

  @Column({ name: 'receipt', default: 0 })
  receipt: number;

  @Column({ name: 'confirmed_date', length: 20 })
  confirmedDate: string;

  @Column({ name: 'shipping_date', length: 20 })
  shippingDate: string;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id' })
  updatedByUserId: number;
}