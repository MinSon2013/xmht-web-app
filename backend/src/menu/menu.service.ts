import { Injectable } from '@nestjs/common';
import { MenuRepository } from './repository/menu.repository';
import { MenuRo } from './ro/menu.ro';
import { MenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
    constructor(
        public readonly menuRepo: MenuRepository,
    ) { }

    async findAll(body: MenuDto): Promise<MenuRo[]> {
        return this.menuRepo.getAll(body);
    }

}
