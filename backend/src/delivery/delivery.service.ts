import { Injectable } from '@nestjs/common';
import { Delivery } from './entities/delivery.entity';
import { DeliveryRepository } from './repository/delivery.repository';

@Injectable()
export class DeliveryService {
    constructor(
        public readonly deliveryRepo: DeliveryRepository,
    ) { }

    async findAll(): Promise<Delivery[]> {
        return await this.deliveryRepo.find();
    }
}
