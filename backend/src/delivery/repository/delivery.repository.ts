import { EntityRepository, Repository } from 'typeorm'
import { Delivery } from '../entities/delivery.entity';

@EntityRepository(Delivery)
export class DeliveryRepository extends Repository<Delivery> {
    
    async findAll(): Promise<Delivery[]> {
        return await this.find();
    }
}