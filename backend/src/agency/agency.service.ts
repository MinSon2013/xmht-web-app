import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ModifyAgencyDTO } from './dto/modify-agency.dto';
import { AgencyRepository } from './repository/agency.repository';
import { AgencyRO } from './ro/agency.ro';

@Injectable()
export class AgencyService {
    constructor(
        public readonly agencyRepo: AgencyRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) { }

    async findAll(): Promise<AgencyRO[]> {
        return await this.agencyRepo.findAll();
    }

    async findOne(userId: number): Promise<AgencyRO> {
        return await this.agencyRepo.getByUserId(userId);
    }

    async create(modifyAgencyDto: ModifyAgencyDTO): Promise<AgencyRO> {
        return await this.agencyRepo.createAgency(modifyAgencyDto, this.userService);
    }

    async update(modifyAgencyDto: ModifyAgencyDTO): Promise<UpdateResult> {
        return await this.agencyRepo.updateAgency(modifyAgencyDto);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.agencyRepo.deleteAgency(id);
    }

    // async getAgencyIdOfAdmin() {
    //     return await this.agencyRepo.getAgencyIdOfAdmin();
    // }

    // async getAgencyIdOfStocker() {
    //     return await this.agencyRepo.getAgencyIdOfStocker();
    // }

    // async createAgencyForUserRole(userId: number, name: string): Promise<Agency> {
    //     return await this.agencyRepo.createAgencyForUserRole(userId, name);
    // }

    // async updateAgencyForUserRole(userId: number, name: string): Promise<Agency> {
    //     return await this.agencyRepo.updateAgencyForUserRole(userId, name);
    // }

    // async deleteAgencyForUserRole(userId: number): Promise<DeleteResult> {
    //     return await this.agencyRepo.deleteAgencyForUserRole(userId);
    // }



    // -- REMOVE ------------------
    async getUserNotAgency(): Promise<AgencyRO[]> {
        return await this.agencyRepo.getUserNotAgency();
    }
}
