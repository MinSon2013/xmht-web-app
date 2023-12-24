import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserRoleController } from './user-role.controller';
import { AgencyModule } from '../agency/agency.module';
import { UserDistrictRepository } from './repository/user-district.repository';
import { AgencyService } from '../agency/agency.service';

@Module({
  controllers: [UsersController, UserRoleController],
  imports: [
    TypeOrmModule.forFeature([UserRepository, UserDistrictRepository]),
    forwardRef(() => AuthModule),
    forwardRef(() => AgencyModule),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    UserService,
    JwtService,
    AgencyService,
  ],
  exports: [
    TypeOrmModule,
    UserService,
  ]
})
export class UserModule { }
