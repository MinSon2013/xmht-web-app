import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryRepository } from './repository/delivery.repository';

@Module({
  controllers: [DeliveryController],
  imports: [
    TypeOrmModule.forFeature([DeliveryRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  providers: [DeliveryService],
  exports: [TypeOrmModule, DeliveryService],
})
export class DeliveryModule {}
