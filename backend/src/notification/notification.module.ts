import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationAgencyRepository } from './repository/notification-agency.repository';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationRepository,
      NotificationAgencyRepository,
    ]),
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    NotificationService,
    ConfigService,
  ],
  controllers: [NotificationController, NotificationsController],
  exports: [TypeOrmModule, NotificationService],
})
export class NotificationModule { }
