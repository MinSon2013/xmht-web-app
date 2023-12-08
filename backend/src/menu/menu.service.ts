import { Injectable } from '@nestjs/common';
import { MenuRepository } from './repository/menu.repository';
import { MenuRo } from './ro/menu.ro';

@Injectable()
export class MenuService {
    constructor(
        public readonly menuRepo: MenuRepository,
    ) { }

    async findAll(isAdmin: boolean): Promise<MenuRo[]> {
        return this.menuRepo.getAll(isAdmin);
    }

}
