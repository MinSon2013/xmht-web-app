import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('report')
export class Reports {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agency_id' })
  agencyId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'district_id' })
  districtId: number;

  @Column({ name: 'province_id' })
  provinceId: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @Column({ name: 'other_store_name', length: 200 })
  otherStoreName: string;

  @Column({ name: 'store_information' })
  storeInformation: string;

  @Column({ name: 'report_content' })
  reportContent: string;

  @Column({ name: 'update_date', length: 20 })
  updateDate: string;

  @Column({ name: 'create_date', length: 20 })
  createDate: string;

  @Column({ name: 'attach_file', length: 255 })
  attachFile: string;

  @Column({ name: 'file_path', length: 255 })
  filePath: string;

  @Column({ name: 'mime_type', length: 255 })
  mimeType: string;

  @Column({ length: 255 })
  note: string;

  @Column({ name: 'updated_by_user_id' })
  updatedByUserId: number;
}