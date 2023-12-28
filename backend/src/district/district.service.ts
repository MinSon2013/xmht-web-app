import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { District } from './entities/district.entity';
import { ModifyDistrictDTO } from './dto/modify-district.dto';
import { DistrictRepository } from './repository/district.repository';

@Injectable()
export class DistrictService {
    constructor(
        public readonly districtRepo: DistrictRepository,
    ) { }

    async findAll(): Promise<District[]> {
        return await this.districtRepo.getAll();
    }

    async findOne(id: number): Promise<District> {
        return await this.districtRepo.getOne(id);
    }

    async create(modifyDistrictDto: ModifyDistrictDTO): Promise<District> {
        return await this.districtRepo.createDistrict(modifyDistrictDto);
    }

    async update(modifyDistrictDto: ModifyDistrictDTO): Promise<UpdateResult> {
        return await this.districtRepo.updateDistrict(modifyDistrictDto);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.districtRepo.deleteDistrict(id);
    }
}
