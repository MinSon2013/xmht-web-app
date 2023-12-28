import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_district')
export class UserDistrict {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'district_id' })
    districtId: number;

    @Column({ name: 'updated_date', length: 20 })
    updatedDate: string;

}