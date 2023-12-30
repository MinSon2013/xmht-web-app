import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { AgencyService } from '../agency/agency.service';
import { DeliveryService } from '../delivery/delivery.service';
import { ProductsService } from '../products/products.service';
import { UserRepository } from '../user/repository/user.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { DeliveryRepository } from '../delivery/repository/delivery.repository';
import { ProductRepository } from '../products/repository/product.repository';
import { ProductOrderRepository } from '../orders/repository/product-order.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MenuModule } from '../menu/menu.module';
import { UserDistrictRepository } from '../user/repository/user-district.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      AgencyRepository,
      DeliveryRepository,
      ProductRepository,
      ProductOrderRepository,
      UserDistrictRepository,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '10000s' }
      })
    }),
    MenuModule,

  ],
  providers: [
    AuthService,
    UserService,
    AgencyService,
    DeliveryService,
    ProductsService,
    JwtStrategy,
    JwtAuthGuard,
    JwtService,
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
