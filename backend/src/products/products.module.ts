import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repository/product.repository';
import { ProductOrderRepository } from '../orders/repository/product-order.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/repository/user.repository';
import { AuthModule } from '../auth/auth.module';
import { UserDistrictRepository } from '../user/repository/user-district.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRepository,
      ProductOrderRepository,
      AgencyRepository,
      UserRepository,
      UserDistrictRepository,
    ]),
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [ProductsService, UserService],
  controllers: [ProductsController],
  exports: [TypeOrmModule, ProductsService,]
})
export class ProductsModule { }
