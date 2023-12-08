import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuRepository } from './repository/menu.repository';

@Module({
    controllers: [MenuController],
    imports: [
        TypeOrmModule.forFeature([MenuRepository]),
        PassportModule.register({ defaultStrategy: 'jwt' })
    ],
    providers: [MenuService],
    exports: [TypeOrmModule, MenuService],
})
export class MenuModule {}
