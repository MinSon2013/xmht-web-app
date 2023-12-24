import { DeleteResult, EntityRepository, Repository } from 'typeorm'
import { UserDistrict } from '../entities/user-district.entity';
import moment from 'moment';

@EntityRepository(UserDistrict)
export class UserDistrictRepository extends Repository<UserDistrict> {

    constructor() {
        super();
    }

    async createUserDistrict(userId: number, districtId: number): Promise<UserDistrict> {
        const userDistrict = new UserDistrict();
        userDistrict.userId = userId;
        userDistrict.districtId = districtId;
        userDistrict.updatedDate = moment(new Date).format('HH:mm DD/MM/YYYY');
        return await this.save(userDistrict);
    }

    async updateUserDistrict(userId: number, districtId: number): Promise<any> {
        return await this.createQueryBuilder()
            .update(UserDistrict)
            .set({ districtId: districtId, updatedDate: moment(new Date).format('HH:mm DD/MM/YYYY') })
            .where("user_id = :userId", { userId })
            .execute();
    }

    async deleteUserDistrict(userId: number): Promise<DeleteResult> {
        return await this.createQueryBuilder()
            .delete()
            .where("user_id = :userId", { userId })
            .execute();
    }
}