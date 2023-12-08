import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'parent_id'}) 
  parentId: number;

  @Column({name: 'route_link', length: 100})
  routeLink: string;

  @Column({ length: 200})
  label: string;

  @Column({ length: 100})
  icon: string;

  @Column({name: 'is_admin', type: 'tinyint'})
  isAdmin: boolean;
}