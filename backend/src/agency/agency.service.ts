import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, Not, UpdateResult } from 'typeorm';
import { ModifyAgencyDto } from './dto/modify-agency.dto';
import { Agency } from './entities/agency.entity';
import { AgencyRepository } from './repository/agency.repository';
import { AuthService } from '../auth/auth.service';
import { AgencyRo } from './ro/agency.ro';

@Injectable()
export class AgencyService {
    constructor(
        public readonly agencyRepo: AgencyRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) { }

    async findAll(): Promise<AgencyRo[]> {
        return await this.agencyRepo.getAgencyList();
    }

    async findAll1(): Promise<Agency[]> { /////
        return await this.agencyRepo.findAll();
    }

    async findOne(userId: number): Promise<AgencyRo> {
        return await this.agencyRepo.getOne(userId);
    }

    async getName(id: number): Promise<string> {
        return await this.agencyRepo.getAgencyName(id);
    }

    async create(modifyAgencyDto: ModifyAgencyDto): Promise<AgencyRo> {
        return await this.agencyRepo.createAgency(modifyAgencyDto, this.userService);
    }

    async update(modifyAgencyDto: ModifyAgencyDto): Promise<UpdateResult> {
        return await this.agencyRepo.updateAgency(modifyAgencyDto, this.authService, this.userService);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.agencyRepo.deleteAgency(id);
    }

    async getAgencyIdOfAdmin() {
        return await this.agencyRepo.getAgencyIdOfAdmin();
    }

    // async getAgencyIdOfStocker() {
    //     return await this.agencyRepo.getAgencyIdOfStocker();
    // }

    async createAgencyForUserRole(userId: number, name: string): Promise<Agency> {
        return await this.agencyRepo.createAgencyForUserRole(userId, name);
    }

    async updateAgencyForUserRole(userId: number, name: string): Promise<Agency> {
        return await this.agencyRepo.updateAgencyForUserRole(userId, name);
    }

    async deleteAgencyForUserRole(userId: number): Promise<DeleteResult> {
        return await this.agencyRepo.deleteAgencyForUserRole(userId);
    }
}
