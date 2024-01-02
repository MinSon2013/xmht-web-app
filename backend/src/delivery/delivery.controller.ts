import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { DeliveryService } from './delivery.service';
import { Delivery } from './entities/delivery.entity';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Delivery[]> {
    return this.deliveryService.findAll()
  }
}
