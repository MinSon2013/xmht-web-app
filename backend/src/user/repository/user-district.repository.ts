import { DeleteResult, EntityRepository, Repository } from 'typeorm'
import { UserDistrict } from '../entities/user-district.entity';
import { Helper } from '../../shared/helper';

@EntityRepository(UserDistrict)
export class UserDistrictRepository extends Repository<UserDistrict> {
    private readonly helper = new Helper();

    constructor() {
        super();
    }

    async getDistrictByUserId(userId: number): Promise<number[]> {
        const res = await this.createQueryBuilder()
            .select('district_id as districtId')
            .where('user_id = :userId', { userId })
            .getMany();

        const districtIds: number[] = [];
        res.forEach(el => {
            districtIds.push(el.districtId);
        });
        return districtIds;
    }

    async createUserDistrict(userId: number, districtId: number): Promise<UserDistrict> {
        const userDistrict = new UserDistrict();
        userDistrict.userId = userId;
        userDistrict.districtId = districtId;
        userDistrict.updatedDate = this.helper.getUpdateDate(2);
        return await this.save(userDistrict);
    }

    async updateUserDistrict(userId: number, districtId: number): Promise<any> {
        return await this.createQueryBuilder()
            .update(UserDistrict)
            .set({ districtId: districtId, updatedDate: this.helper.getUpdateDate(2) })
            .where("user_id = :userId", { userId })
            .execute();
    }

    async deleteUserDistrict(userId: number): Promise<DeleteResult> {
        return await this.createQueryBuilder()
            .delete()
            .where("user_id = :userId", { userId })
            .execute();
    }

    async deleteByDistrictId(districtId: number): Promise<DeleteResult> {
        return await this.createQueryBuilder()
            .delete()
            .where("district_id = :districtId", { districtId })
            .execute();
    }
}