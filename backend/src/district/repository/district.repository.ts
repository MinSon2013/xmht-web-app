import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { District } from '../entities/district.entity';
import { ModifyDistrictDTO } from '../dto/modify-district.dto';
import { Helper } from '../../shared/helper';

@EntityRepository(District)
export class DistrictRepository extends Repository<District> {
    private readonly helper = new Helper();

    constructor() {
        super();
    }

    async getAll(): Promise<District[]> {
        return await this.find();
    }

    async getOne(id: number): Promise<District> {
        return await this.findOne({
            where: {
                id
            },
        })
    }

    async createDistrict(modifyDistrictDto: ModifyDistrictDTO): Promise<District> {
        const districtEntity = this.mappingDistrict(modifyDistrictDto);
        const district = await this.save(districtEntity);
        return district;
    }

    async updateDistrict(modifyDistrictDto: ModifyDistrictDTO): Promise<UpdateResult> {
        const district = this.mappingDistrict(modifyDistrictDto);
        return await this.update(modifyDistrictDto.id, district);
    }

    async deleteDistrict(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private mappingDistrict(modifiedDto: ModifyDistrictDTO): District {
        const entity = new District();
        entity.name = modifiedDto.name;
        entity.provinceId = modifiedDto.provinceId;
        entity.updatedByUserId = modifiedDto.updatedByUserId;
        entity.updatedDate = this.helper.getUpdateDate(2);
        return entity;
    }
}