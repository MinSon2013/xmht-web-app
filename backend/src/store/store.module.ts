import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { StoreController } from './store.controller';
import { StoreRepository } from './repository/store.repository';
import { StoreService } from './store.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [StoreController],
  imports: [
    TypeOrmModule.forFeature([
      StoreRepository,
    ]),
    UserModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    StoreService,
    UserService,
  ],
  exports: [TypeOrmModule]
})
export class StoreModule { }
