import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { ModifyStoreDto } from '../dto/modify-store.dto';
import { Store } from '../entities/store.entity';
import moment from 'moment';

@EntityRepository(Store)
export class StoreRepository extends Repository<Store> {

    constructor() {
        super();
    }

    async getAll(): Promise<Store[]> {
        return await this.find();
    }

    async getOne(id: number): Promise<Store> {
        return await this.findOne({
            where: {
                id
            },
        })
    }

    async createStore(modifyStoreDto: ModifyStoreDto): Promise<Store> {
        const storeEntity = this.mappingStore(modifyStoreDto);
        const store = await this.save(storeEntity);
        return store;
    }

    async updateStore(modifyStoreDto: ModifyStoreDto
    ): Promise<UpdateResult> {
        const store = this.mappingStore(modifyStoreDto);
        return await this.update(modifyStoreDto.id, store);
    }

    async deleteStore(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private mappingStore(modifyStoreDto: ModifyStoreDto): Store {
        const store = new Store();
        store.storeName = modifyStoreDto.storeName;
        store.agencyId = modifyStoreDto.agencyId;
        store.districtId = modifyStoreDto.districtId;
        store.provinceId = modifyStoreDto.provinceId;
        store.address = modifyStoreDto.address;
        store.note = modifyStoreDto.note;
        store.phone = modifyStoreDto.phone;
        store.updatedDate = moment(new Date).format('HH:mm DD/MM/YYYY');
        store.userId = modifyStoreDto.userId;
        return store;
    }
}