import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { ModifyStoreDTO } from '../dto/modify-store.dto';
import { Store } from '../entities/store.entity';
import { Helper } from '../../shared/helper';

@EntityRepository(Store)
export class StoreRepository extends Repository<Store> {
    private readonly helper = new Helper();
    constructor() {
        super();
    }

    async getOne(id: number): Promise<Store> {
        return await this.findOne({
            where: {
                id
            },
        })
    }

    async createStore(modifyStoreDto: ModifyStoreDTO): Promise<Store> {
        const storeEntity = this.mappingStore(modifyStoreDto);
        const store = await this.save(storeEntity);
        return store;
    }

    async updateStore(modifyStoreDto: ModifyStoreDTO): Promise<UpdateResult> {
        const store = this.mappingStore(modifyStoreDto);
        return await this.update(modifyStoreDto.id, store);
    }

    async deleteStore(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private mappingStore(modifyStoreDto: ModifyStoreDTO): Store {
        const store = new Store();
        store.storeName = modifyStoreDto.storeName;
        store.agencyId = modifyStoreDto.agencyId;
        store.districtId = modifyStoreDto.districtId;
        store.provinceId = modifyStoreDto.provinceId;
        store.address = modifyStoreDto.address;
        store.note = modifyStoreDto.note;
        store.phone = modifyStoreDto.phone;
        store.updatedDate = this.helper.getUpdateDate(2);
        store.updatedByUserId = modifyStoreDto.updatedByUserId;
        return store;
    }
}