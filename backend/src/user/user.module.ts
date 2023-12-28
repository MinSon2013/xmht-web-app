import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserDistrictRepository } from './repository/user-district.repository';

@Module({
  controllers: [UsersController],
  imports: [
    TypeOrmModule.forFeature([UserRepository, UserDistrictRepository]),
    forwardRef(() => AuthModule),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    UserService,
    JwtService,
  ],
  exports: [
    TypeOrmModule,
    UserService,
  ]
})
export class UserModule { }
