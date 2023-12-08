import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('agency')
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' }) 
  userId: number;

  @Column({ name: 'full_name', length: 200 }) 
  fullName: string;

  @Column({ length: 500 }) 
  address: string;

  @Column({ length: 12 }) 
  phone: string;

  @Column({ length: 500 }) 
  note: string;

  @Column({ length: 200 }) 
  email: string;

  @Column({ length: 200 }) 
  contract: string;
}