import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { UserService } from '../../user/user.service';
import { Users } from '../../user/entities/user.entity';
import { AuthService } from '../../auth/auth.service';
import { District } from '../entities/district.entity';
import { ModifyDistrictDto } from '../dto/modify-district.dto';
import moment from 'moment';

@EntityRepository(District)
export class DistrictRepository extends Repository<District> {

    constructor() {
        super();
    }

    async getAll(): Promise<District[]> {
        return await this.find();
    }

    async getOne(userId: number): Promise<District> {
        return await this.findOne({
            where: {
                userId
            },
        })
    }

    async createDistrict(modifyDistrictDto: ModifyDistrictDto): Promise<District> {
        const districtEntity = this.mappingDistrict(modifyDistrictDto);
        const district = await this.save(districtEntity);
        return district;
    }

    async updateDistrict(modifyDistrictDto: ModifyDistrictDto
    ): Promise<UpdateResult> {
        const district = this.mappingDistrict(modifyDistrictDto);
        return await this.update(modifyDistrictDto.id, district);
    }

    async deleteDistrict(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private mappingDistrict(modifyDistrictDto: ModifyDistrictDto): District {
        const district = new District();
        district.name = modifyDistrictDto.name;
        district.userId = modifyDistrictDto.userId;
        district.provinceId = modifyDistrictDto.provinceId;
        district.updatedDate = moment(new Date).format('HH:mm DD/MM/YYYY');
        return district;
    }
}