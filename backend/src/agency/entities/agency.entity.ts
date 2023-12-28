import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('agency')
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'agency_name', length: 255 })
  agencyName: string;

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

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id', default: 0 })
  updatedByUserId: number;
}