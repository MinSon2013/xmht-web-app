import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { StoreRepository } from './repository/store.repository';
import { Store } from './entities/store.entity';
import { ModifyStoreDTO } from './dto/modify-store.dto';

@Injectable()
export class StoreService {
    constructor(
        public readonly storeRepo: StoreRepository,
        private readonly userService: UserService,
    ) { }

    async findAll(userId: number, agencyId: number): Promise<Store[]> {
        const userEntity = await this.userService.getOne(userId);
        if (userEntity) {
            if (!userEntity.isAdmin && agencyId > 0) {
                return await this.storeRepo.createQueryBuilder()
                    .where("agency_id = :agencyId", { agencyId })
                    .groupBy("agency_id")
                    .addGroupBy("district_id")
                    .addGroupBy("province_id")
                    .addGroupBy("id")
                    .getMany();
            } else {
                return await this.storeRepo.createQueryBuilder()
                    .groupBy("agency_id")
                    .addGroupBy("district_id")
                    .addGroupBy("province_id")
                    .addGroupBy("id")
                    .getMany();
            }
        } else {
            return [];
        }
    }

    async findOne(id: number): Promise<Store> {
        return await this.storeRepo.getOne(id);
    }

    async create(modifyStoreDto: ModifyStoreDTO): Promise<Store> {
        return await this.storeRepo.createStore(modifyStoreDto);
    }

    async update(modifyStoreDto: ModifyStoreDTO): Promise<UpdateResult> {
        return await this.storeRepo.updateStore(modifyStoreDto);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.storeRepo.deleteStore(id);
    }
}
