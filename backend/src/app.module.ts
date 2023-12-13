import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AgencyModule } from './agency/agency.module';
import { OrdersModule } from './orders/orders.module';
import { DeliveryModule } from './delivery/delivery.module';
import { MenuModule } from './menu/menu.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { NotificationModule } from './notification/notification.module';
import { EventsModule } from './events/events.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { DistrictModule } from './district/district.module';
import { StoreModule } from './store/store.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
        JWT_SECRET_KEY: Joi.string().required(),
      })
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [],
        //entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    AuthModule,
    AgencyModule,
    OrdersModule,
    DeliveryModule,
    MenuModule,
    UserModule,
    NotificationModule,
    EventsModule,
    DistrictModule,
    StoreModule,
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: '/auth/login',
          method: RequestMethod.POST
        },
        {
          path: '/notification/download',
          method: RequestMethod.GET
        },
      )
      .forRoutes('')
  }
}
