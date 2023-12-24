import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { EventsGateway } from './events.gateway';
import { OrdersService } from '../orders/orders.service';
import { AgencyService } from '../agency/agency.service';
import { NotificationService } from '../notification/notification.service';
import { ProductsService } from '../products/products.service';
import { MenuService } from '../menu/menu.service';
import { DeliveryService } from '../delivery/delivery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/repository/user.repository';
import { NotificationRepository } from '../notification/repository/notification.repository';
import { NotificationAgencyRepository } from '../notification/repository/notification-agency.repository';
import { OrderRepository } from '../orders/repository/order.repository';
import { ProductRepository } from '../products/repository/product.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { ProductOrderRepository } from '../orders/repository/product-order.repository';
import { MenuRepository } from '../menu/repository/menu.repository';
import { DeliveryRepository } from '../delivery/repository/delivery.repository';
import { JwtService } from '@nestjs/jwt';
import { UserDistrictRepository } from '../user/repository/user-district.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            NotificationRepository,
            NotificationAgencyRepository,
            UserRepository,
            OrderRepository,
            ProductRepository,
            AgencyRepository,
            ProductOrderRepository,
            MenuRepository,
            DeliveryRepository,
            UserDistrictRepository,
        ]),
    ],
    providers: [
        EventsGateway,
        AuthService,
        UserService,
        OrdersService,
        ProductsService,
        AgencyService,
        NotificationService,
        MenuService,
        DeliveryService,
        JwtService
    ]
})
export class EventsModule { }
