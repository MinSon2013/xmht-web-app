import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('district')
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'province_id', length: 255 })
  provinceId: string;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id', default: 0 })
  updatedByUserId: number;
}