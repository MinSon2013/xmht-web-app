import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 200 })
  fullName: string;

  @Column({ name: 'username', length: 200 })
  userName: string;

  @Column({ name: 'password', length: 500 })
  password: string;

  @Column({ name: 'is_admin' })
  isAdmin: boolean;

  @Column()
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: number;

  @Column({ name: 'role' })
  role: number;

  @Column({ name: 'updated_date', length: 20 })
  updatedDate: string;

  @Column({ name: 'updated_by_user_id' })
  updatedByUserId: number;
}