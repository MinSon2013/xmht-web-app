import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_order')
export class ProductOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'product_id'}) 
  productId: number;

  @Column({name: 'order_id'}) 
  orderId: number;

  @Column() 
  quantity: string;

  @Column({ name: 'created_date', length: 12 }) 
  createdDate: string;

}