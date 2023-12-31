import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MenuService } from './menu.service';
import { MenuRo } from './ro/menu.ro';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Body() isAdmin: boolean): Promise<MenuRo[]> {
      return this.menuService.findAll(isAdmin)
    }
}
