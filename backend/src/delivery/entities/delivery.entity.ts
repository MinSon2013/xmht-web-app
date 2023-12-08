import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('delivery')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 }) 
  label: string;
}