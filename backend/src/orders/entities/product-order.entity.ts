import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_order')
export class ProductOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ length: 20 })
  quantity: string;

  @Column({ name: 'created_date', length: 20 })
  createdDate: string;

}