import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('store')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agency_id' })
  agencyId: number;

  @Column({ name: 'district_id' })
  districtId: number;

  @Column({ name: 'province_id' })
  provinceId: number;

  @Column({ name: 'store_name', length: 255 })
  storeName: string;

  @Column({ name: 'address', length: 255 })
  address: string;

  @Column({ name: 'phone', length: 12 })
  phone: string;

  @Column({ length: 255 })
  note: string;

  @Column({ name: 'updated_date', length: 18 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id', default: 0 })
  updatedByUserId: number;
}