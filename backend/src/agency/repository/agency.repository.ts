import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Agency } from '../entities/agency.entity';
import { ModifyAgencyDTO } from '../dto/modify-agency.dto';
import { UserService } from '../../user/user.service';
import { Users } from '../../user/entities/user.entity';
import { AgencyRO } from '../ro/agency.ro';
import { Helper } from '../../shared/helper';
import { UserDTO } from '../../user/dto/user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@EntityRepository(Agency)
export class AgencyRepository extends Repository<Agency> {
    private readonly helper = new Helper();

    constructor() {
        super();
    }

    async findAll(agencyId: number): Promise<AgencyRO[]> {
        let sql = this.createQueryBuilder('a')
            .innerJoinAndSelect(Users, 'u', 'u.id = a.user_id');

        if (agencyId > 0) {
            sql = sql.where('a.id = :agencyId', { agencyId });
        }

        const result = await sql.orderBy('a.id').getRawMany();
        const res: AgencyRO[] = [];
        result.forEach(element => {
            const item = new AgencyRO();
            item.id = element.a_id;
            item.agencyName = element.a_agency_name;
            item.address = element.a_address;
            item.contract = element.a_contract;
            item.note = element.a_note;
            item.email = element.a_email;
            item.phone = element.a_phone;
            item.userId = element.u_id;
            item.userName = element.u_username;
            res.push(item);
        });
        return res;
    }

    // -- REMOVE after sync -----
    async getAgencyList() {
        const ids = await this.getIdsNotAgency();
        const result = await this.createQueryBuilder('a')
            .innerJoinAndSelect(Users, 'u', 'u.id = a.user_id')
            .where('a.id NOT IN (:ids)', { ids })
            .getRawMany();

        const res: AgencyRO[] = [];
        result.forEach(element => {
            const item = new AgencyRO();
            item.id = element.a_id;
            item.agencyName = element.a_agency_name;
            item.address = element.a_address;
            item.contract = element.a_contract;
            item.note = element.a_note;
            item.email = element.a_email;
            item.phone = element.a_phone;
            item.userId = element.u_id;
            item.userName = element.u_username;
            res.push(item);
        });
        return res;
    }

    async getByUserId(userId: number): Promise<AgencyRO> {
        const res = await this.createQueryBuilder('a')
            .innerJoinAndSelect(Users, 'u', 'u.id = a.user_id')
            .where('a.user_id = :userId', { userId })
            .getRawOne();

        const agencyRo = new AgencyRO();
        agencyRo.id = res.a_id;
        agencyRo.agencyName = res.a_agency_name;
        agencyRo.address = res.a_address;
        agencyRo.contract = res.a_contract;
        agencyRo.note = res.a_note;
        agencyRo.email = res.a_email;
        agencyRo.phone = res.a_phone;
        agencyRo.userId = res.u_id;
        agencyRo.userName = res.u_username;
        return agencyRo;
    }

    async createAgency(modifyAgencyDto: ModifyAgencyDTO, userService: UserService): Promise<AgencyRO> {
        try {
            const userDTO: UserDTO = {
                userName: modifyAgencyDto.userName,
                password: modifyAgencyDto.password,
                role: modifyAgencyDto.role,
                districtId: 0,
                fullName: modifyAgencyDto.agencyName,
                updatedByUserId: modifyAgencyDto.updatedByUserId,
            }
            const user = await userService.createUser(userDTO);

            const agencyEntity = this.mappingAgency(modifyAgencyDto);
            agencyEntity.userId = user.id;
            await this.save(agencyEntity);
            return this.getByUserId(agencyEntity.userId);
        } catch (err) {
            throw new HttpException('Username is already in users', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAgency(modifyAgencyDto: ModifyAgencyDTO
    ): Promise<UpdateResult> {
        const agency = this.mappingAgency(modifyAgencyDto);

        //// Update user fullname
        // await userService.updateFullName(modifyAgencyDto.userId, modifyAgencyDto.agencyName);

        return await this.update(modifyAgencyDto.id, agency);
    }

    async deleteAgency(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    async deleteAgencyByUserId(userId: number) {
        return await this.createQueryBuilder()
            .delete().where('user_id = :userId', { userId }).execute();
    }

    // public async getAgencyIdOfAdmin() {
    //     const admin = await this.createQueryBuilder()
    //         .select('a.id as agencyId')
    //         .from(Agency, 'a')
    //         .innerJoin(Users, 'u', 'u.id = a.user_id')
    //         .where('u.is_admin IS TRUE')
    //         .getRawOne();
    //     return admin.agencyId;
    // }

    // public async getAgencyIdOfStocker() {
    //     const stocker = await this.createQueryBuilder()
    //         .select('a.id as agencyId')
    //         .from(Agency, 'a')
    //         .innerJoin(Users, 'u', 'u.id = a.user_id')
    //         .where('u.is_stocker IS TRUE')
    //         .getRawOne();
    //     return stocker.agencyId;
    // }

    private mappingAgency(modifiedDto: ModifyAgencyDTO): Agency {
        const entity = new Agency();
        entity.userId = modifiedDto.userId;
        entity.agencyName = modifiedDto.agencyName;
        entity.address = modifiedDto.address;
        entity.contract = modifiedDto.contract;
        entity.note = modifiedDto.note;
        entity.email = modifiedDto.email;
        entity.phone = modifiedDto.phone;
        entity.updatedByUserId = modifiedDto.updatedByUserId;
        entity.updatedDate = this.helper.getUpdateDate(1);
        return entity;
    }

    // async createAgencyForUserRole(userId: number, name: string): Promise<Agency> {
    //     const agencyEntity = new Agency();
    //     agencyEntity.userId = userId;
    //     agencyEntity.agencyName = name;
    //     const agency = await this.save(agencyEntity);
    //     return agency;
    // }

    // async updateAgencyForUserRole(userId: number, name: string): Promise<any> {
    //     return await this.createQueryBuilder()
    //         .update(Agency)
    //         .set({ agencyName: name })
    //         .where("user_id = :userId", { userId })
    //         .execute();
    // }

    // async deleteAgencyForUserRole(userId: number): Promise<DeleteResult> {
    //     return await this.createQueryBuilder()
    //         .delete()
    //         .where("user_id = :userId", { userId })
    //         .execute();
    // }


    //----- REMOVE ----------
    public async getIdsNotAgency() {
        const res = await this.createQueryBuilder('a')
            .leftJoin(Users, 'u', 'u.id = a.user_id')
            .where('u.is_admin IS TRUE')
            .orWhere('u.role IN (1, 2, 3)')
            .getMany();

        const ids: number[] = [];
        res.forEach(element => {
            ids.push(element.id);
        });
        return ids;
    }

    public async getUserNotAgency() {
        const res = await this.createQueryBuilder('a')
            .leftJoinAndSelect(Users, 'u', 'u.id = a.user_id')
            .where('u.is_admin IS TRUE')
            .orWhere('u.role IN (1, 2, 3)')
            .getRawMany();

        const result: AgencyRO[] = [];
        res.forEach(element => {
            const item = new AgencyRO();
            item.id = element.a_id;
            item.agencyName = element.a_agency_name;
            item.address = element.a_address;
            item.contract = element.a_contract;
            item.note = element.a_note;
            item.email = element.a_email;
            item.userId = element.u_id;
            item.phone = element.a_phone;
            item.userName = element.u_username;
            result.push(item);
        });
        return result;
    }
}