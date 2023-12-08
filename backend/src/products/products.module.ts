import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repository/product.repository';
import { ProductOrderRepository } from '../orders/repository/product-order.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductRepository, ProductOrderRepository, AgencyRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [TypeOrmModule, ProductsService,]
})
export class ProductsModule {}
