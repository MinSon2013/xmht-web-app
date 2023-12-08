import { EntityRepository, Repository } from 'typeorm'
import { Menu } from '../entities/menu.entity';
import { MenuRo } from '../ro/menu.ro';

@EntityRepository(Menu)
export class MenuRepository extends Repository<Menu> {

    async getAll(isAdmin: boolean): Promise<MenuRo[]> {
        let menuRo: MenuRo[] = [];
        const menus = await this.find({
            where: {
                parentId: 0,
            }
        });
        for (let element of menus) {
            const parent = new MenuRo();
            parent.routeLink = element.routeLink;
            parent.icon = element.icon;
            parent.label = element.label;
            parent.expanded = true; // sub-menu always expanded

            // Get menu child
            const items = await this.find({
                where: { parentId: element.id }
            });
            if (items.length > 0) {
                items.forEach(el => {
                    const child = new MenuRo();
                    child.routeLink = el.routeLink;
                    child.icon = el.icon;
                    child.label = el.label;
                    parent.items.push(child);
                });
            }
            if (isAdmin) {
                menuRo.push(parent);
            } else if (!isAdmin && !element.isAdmin) {
                menuRo.push(parent);
            }

        }
        return menuRo;
    }
}