import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300 }) 
  name: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column({length: 500})
  note: string;

  @Column({ name: 'created_date'})
  createdDate: string;

  @Column({ name: 'updated_date' })
  updatedDate: string;
}