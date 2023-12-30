import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ModifyAgencyDTO } from './dto/modify-agency.dto';
import { AgencyRepository } from './repository/agency.repository';
import { AgencyRO } from './ro/agency.ro';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AgencyService {
    constructor(
        public readonly agencyRepo: AgencyRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) { }

    async findAll(agencyId: number): Promise<AgencyRO[]> {
        return await this.agencyRepo.findAll(agencyId);
    }

    /// --- REMOVE after sync
    async getAgencyList(): Promise<AgencyRO[]> {
        return await this.agencyRepo.getAgencyList();
    }

    async findOne(userId: number): Promise<AgencyRO> {
        return await this.agencyRepo.getByUserId(userId);
    }

    async create(modifyAgencyDto: ModifyAgencyDTO): Promise<AgencyRO> {
        return await this.agencyRepo.createAgency(modifyAgencyDto, this.userService);
    }

    async update(modifyAgencyDto: ModifyAgencyDTO): Promise<UpdateResult> {
        return await this.agencyRepo.updateAgency(modifyAgencyDto, this.authService, this.userService);
    }

    async delete(id: number, userId: number): Promise<DeleteResult> {
        await this.agencyRepo.deleteAgency(id);
        return await this.userService.deleteUser(userId);
    }

    //-- REMOVE after sync
    async deleteSync(id: number): Promise<DeleteResult> {
        return await this.agencyRepo.deleteAgency(id);
    }

    // -- REMOVE ------------------
    async getUserNotAgency(): Promise<AgencyRO[]> {
        return await this.agencyRepo.getUserNotAgency();
    }
}
