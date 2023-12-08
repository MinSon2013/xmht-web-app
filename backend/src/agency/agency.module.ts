import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { AgencyRepository } from './repository/agency.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AgencyController],
  imports: [
    TypeOrmModule.forFeature([
      AgencyRepository,
    ]),
    forwardRef(() => AuthModule),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    AgencyService,
    UserService,
  ],
  exports: [TypeOrmModule]
})
export class AgencyModule { }
