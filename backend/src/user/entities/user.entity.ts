import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'username', length: 255 })
  userName: string;

  @Column({ name: 'password', length: 30 })
  password: string;

  @Column({ name: 'is_admin' })
  isAdmin: boolean;

  @Column({ name: 'role' })
  role: number;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id', default: 0 })
  updatedByUserId: number;

  @Column()
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: number;
}