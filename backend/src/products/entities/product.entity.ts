import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column({ length: 500 })
  note: string;

  @Column({ name: 'created_date', length: 20 })
  createdDate: string;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id', default: 0 })
  updatedByUserId: number;
}