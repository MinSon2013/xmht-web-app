import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from '../agency/agency.service';
import { NotificationService } from '../notification/notification.service';
import { ProductsService } from '../products/products.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserService } from '../user/user.service';
import { OrderRepository } from './repository/order.repository';
import { ProductOrderRepository } from './repository/product-order.repository';
import { ProductRepository } from '../products/repository/product.repository';
import { UserRepository } from '../user/repository/user.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { NotificationRepository } from '../notification/repository/notification.repository';
import { NotificationAgencyRepository } from '../notification/repository/notification-agency.repository';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [OrdersController],
  imports: [
    TypeOrmModule.forFeature([
      OrderRepository,
      ProductOrderRepository,
      ProductRepository,
      NotificationRepository,
      NotificationAgencyRepository,
      AgencyRepository,
      UserRepository,
    ]),
    AuthModule,
    ProductsModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    OrdersService,
    ProductsService,
    UserService,
    NotificationService,
    AgencyService,
  ],
})
export class OrdersModule { }
