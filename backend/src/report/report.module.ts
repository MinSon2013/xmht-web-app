import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { ReportService } from './report.service';
import { ReportRepository } from './repository/report.repository';
import { ReportController } from './report.controller';
import { NotificationService } from '../notification/notification.service';
import { NotificationRepository } from '../notification/repository/notification.repository';
import { NotificationAgencyRepository } from '../notification/repository/notification-agency.repository';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [ReportController, ReportsController],
  imports: [
    TypeOrmModule.forFeature([
      ReportRepository,
      NotificationRepository,
      NotificationAgencyRepository,
    ]),
    forwardRef(() => AuthModule),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    ReportService,
    UserService,
    NotificationService,
  ],
  exports: [TypeOrmModule, ReportService]
})
export class ReportModule { }
