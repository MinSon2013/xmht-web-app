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

  @Column({ name: 'updated_date', length: 18 })
  updatedDate: string;
}