import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('district')
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'province_id' })
  provinceId: string;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id' })
  updatedByUserId: number;
}