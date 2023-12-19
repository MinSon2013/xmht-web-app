import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { StoreController } from './store.controller';
import { StoreRepository } from './repository/store.repository';
import { StoreService } from './store.service';

@Module({
  controllers: [StoreController],
  imports: [
    TypeOrmModule.forFeature([
      StoreRepository,
    ]),
    forwardRef(() => AuthModule),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [
    StoreService,
    UserService,
  ],
  exports: [TypeOrmModule]
})
export class StoreModule { }
