import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, Not, UpdateResult } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { District } from './entities/district.entity';
import { ModifyDistrictDto } from './dto/modify-district.dto';
import { DistrictRepository } from './repository/district.repository';

@Injectable()
export class DistrictService {
    constructor(
        public readonly districtRepo: DistrictRepository,
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) { }

    async findAll(): Promise<District[]> {
        return await this.districtRepo.getAll();
    }

    async findOne(userId: number): Promise<District> {
        return await this.districtRepo.getOne(userId);
    }

    async create(modifyDistrictDto: ModifyDistrictDto): Promise<District> {
        return await this.districtRepo.createDistrict(modifyDistrictDto);
    }

    async update(modifyDistrictDto: ModifyDistrictDto): Promise<UpdateResult> {
        return await this.districtRepo.updateDistrict(modifyDistrictDto);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.districtRepo.deleteDistrict(id);
    }
}
