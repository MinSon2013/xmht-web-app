import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationAgencyRepository } from './repository/notification-agency.repository';
import { PassportModule } from '@nestjs/passport';
import { AgencyService } from '../agency/agency.service';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../user/repository/user.repository';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationRepository,
      NotificationAgencyRepository,
      AgencyRepository,
      UserRepository,
    ]),
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [NotificationService,
    ConfigService,
    UserService,
    AgencyService,
  ],
  controllers: [NotificationController],
  exports: [TypeOrmModule, NotificationService],
})
export class NotificationModule { }
