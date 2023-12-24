import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  username: string;

  @Column({ length: 500 })
  password: string;

  @Column({ name: 'is_admin' })
  isAdmin: boolean;

  @Column()
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: number;

  @Column({ name: 'is_stocker' })
  isStocker: boolean;

  @Column({ name: 'role' })
  role: number;
}