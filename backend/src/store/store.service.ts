import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { StoreRepository } from './repository/store.repository';
import { Store } from './entities/store.entity';
import { ModifyStoreDto } from './dto/modify-store.dto';

@Injectable()
export class StoreService {
    constructor(
        public readonly storeRepo: StoreRepository,
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) { }

    async findAll(): Promise<Store[]> {
        return await this.storeRepo.getAll();
    }

    async findOne(id: number): Promise<Store> {
        return await this.storeRepo.getOne(id);
    }

    async create(modifyDistrictDto: ModifyStoreDto): Promise<Store> {
        return await this.storeRepo.createStore(modifyDistrictDto);
    }

    async update(modifyDistrictDto: ModifyStoreDto): Promise<UpdateResult> {
        return await this.storeRepo.updateStore(modifyDistrictDto);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.storeRepo.deleteStore(id);
    }
}
