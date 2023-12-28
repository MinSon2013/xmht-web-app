import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { DistrictController } from './district.controller';
import { DistrictRepository } from './repository/district.repository';
import { DistrictService } from './district.service';
import { AgencyService } from '../agency/agency.service';
import { AgencyRepository } from '../agency/repository/agency.repository';

@Module({
  controllers: [DistrictController],
  imports: [
    TypeOrmModule.forFeature([
      DistrictRepository,
      //AgencyRepository,
    ]),
    forwardRef(() => AuthModule),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    DistrictService,
    UserService,
    //AgencyService,
  ],
  exports: [TypeOrmModule]
})
export class DistrictModule { }
