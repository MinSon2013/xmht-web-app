import { EntityRepository, Repository } from 'typeorm'
import { Menu } from '../entities/menu.entity';
import { MenuRo } from '../ro/menu.ro';
import { MenuDto } from '../dto/menu.dto';
import { filter } from 'rxjs';

@EntityRepository(Menu)
export class MenuRepository extends Repository<Menu> {

    async getAll(body: MenuDto): Promise<MenuRo[]> {
        let menuRo: MenuRo[] = [];
        let sql = this.createQueryBuilder();

        if (!body.isAdmin) {
            sql = sql.where('role IN (0, :role)', { role: body.role });
        }
        const raw = await sql.orderBy('position', 'ASC').getMany();

        const menuParent = raw.filter(x => x.parentId === 0);
        const menuChild = raw.filter(x => x.parentId !== 0);

        menuParent.forEach(element => {
            const parent = new MenuRo();
            parent.routeLink = element.routeLink;
            parent.icon = element.icon;
            parent.label = element.label;
            parent.expanded = true;
            parent.position = element.position;
            parent.role = element.role;

            const itemChilds = menuChild.filter(y => y.parentId === element.id);
            if (itemChilds.length > 0) {
                itemChilds.forEach(el => {
                    const child = new MenuRo();
                    child.routeLink = el.routeLink;
                    child.icon = el.icon;
                    child.label = el.label;
                    parent.items.push(child);
                });
            }

            menuRo.push(parent);
        });
        return menuRo;
    }
}