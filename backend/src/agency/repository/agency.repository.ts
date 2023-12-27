import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Agency } from '../entities/agency.entity';
import { ModifyAgencyDto } from '../dto/modify-agency.dto';
import { UserService } from '../../user/user.service';
import { Users } from '../../user/entities/user.entity';
import { AuthService } from '../../auth/auth.service';
import { AgencyRo } from '../ro/agency.ro';
import { Helper } from '../../shared/helper';

@EntityRepository(Agency)
export class AgencyRepository extends Repository<Agency> {
    private readonly helper = new Helper();

    constructor() {
        super();
    }

    async findAll(): Promise<Agency[]> {
        return await this.find();
    }

    async getOne(userId: number): Promise<AgencyRo> {
        const res = await this.createQueryBuilder('a')
            .leftJoinAndSelect(Users, 'u', 'u.id = a.user_id')
            .where('a.user_id = :userId', { userId })
            .getRawOne();

        const agencyRo = new AgencyRo();
        agencyRo.id = res.a_id;
        agencyRo.agencyName = res.a_agency_name;
        agencyRo.address = res.a_address;
        agencyRo.contract = res.a_contract;
        agencyRo.note = res.a_note;
        agencyRo.email = res.a_email;
        agencyRo.userId = res.u_id;
        agencyRo.phone = res.a_phone;
        agencyRo.userName = res.u_username;
        agencyRo.role = res.u_role;
        agencyRo.isAdmin = res.u_is_admin;
        return agencyRo;
    }

    async getAgencyName(id: number): Promise<string> {
        const agency = await this.findOne({
            where: {
                id
            },
        })

        if (agency) {
            return agency.agencyName;
        }

        return '';
    }

    async createAgency(modifyAgencyDto: ModifyAgencyDto, userService: UserService): Promise<AgencyRo> {
        const userEntity = {
            userName: modifyAgencyDto.userName,
            password: modifyAgencyDto.password,
            isAdmin: false,
            token: '',
            expiresAt: 0,
            role: modifyAgencyDto.role,
        }
        const user = await userService.createUser(userEntity);

        const agencyEntity = this.mappingAgency(modifyAgencyDto);
        agencyEntity.userId = user.id;
        const agency = await this.save(agencyEntity);
        return this.getOne(agencyEntity.userId);
    }

    async updateAgency(modifyAgencyDto: ModifyAgencyDto,
        authService: AuthService,
        userService: UserService
    ): Promise<UpdateResult> {
        const agency = this.mappingAgency(modifyAgencyDto);
        const user: Users = await userService.getOne(modifyAgencyDto.userId);

        // Update role for agency
        if (user.role === 0) {
            await userService.updateAgencyRole(modifyAgencyDto.userId, modifyAgencyDto.role);
        }

        if (modifyAgencyDto.password && modifyAgencyDto.password !== user.password) {
            const matches: boolean = await authService.validatePassword(modifyAgencyDto.password, user.password);
            if (!matches) {
                await userService.updateUserPassword(modifyAgencyDto.id, modifyAgencyDto.password);
            }
        }
        agency.userId = user.id;
        return await this.update(modifyAgencyDto.id, agency);
    }

    async deleteAgency(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    public async getAgencyIdOfAdmin() {
        const admin = await this.createQueryBuilder()
            .select('a.id as agencyId')
            .from(Agency, 'a')
            .innerJoin(Users, 'u', 'u.id = a.user_id')
            .where('u.is_admin IS TRUE')
            .getRawOne();
        return admin.agencyId;
    }

    // public async getAgencyIdOfStocker() {
    //     const stocker = await this.createQueryBuilder()
    //         .select('a.id as agencyId')
    //         .from(Agency, 'a')
    //         .innerJoin(Users, 'u', 'u.id = a.user_id')
    //         .where('u.is_stocker IS TRUE')
    //         .getRawOne();
    //     return stocker.agencyId;
    // }

    private mappingAgency(modifiedDto: ModifyAgencyDto): Agency {
        const entity = new Agency();
        entity.agencyName = modifiedDto.agencyName;
        entity.address = modifiedDto.address;
        entity.contract = modifiedDto.contract;
        entity.note = modifiedDto.note;
        entity.email = modifiedDto.email;
        entity.userId = modifiedDto.userId;
        entity.phone = modifiedDto.phone;
        entity.updatedByUserId = modifiedDto.updatedByUserId;
        entity.updatedDate = this.helper.getUpdateDate(1);
        return entity;
    }

    async createAgencyForUserRole(userId: number, name: string): Promise<Agency> {
        const agencyEntity = new Agency();
        agencyEntity.userId = userId;
        agencyEntity.agencyName = name;
        const agency = await this.save(agencyEntity);
        return agency;
    }

    async updateAgencyForUserRole(userId: number, name: string): Promise<any> {
        return await this.createQueryBuilder()
            .update(Agency)
            .set({ agencyName: name })
            .where("user_id = :userId", { userId })
            .execute();
    }

    async deleteAgencyForUserRole(userId: number): Promise<DeleteResult> {
        return await this.createQueryBuilder()
            .delete()
            .where("user_id = :userId", { userId })
            .execute();
    }

    public async getAgencyList() {
        const ids = await this.getIdsNotAgency();
        const result = await this.createQueryBuilder('a')
            .leftJoinAndSelect(Users, 'u', 'u.id = a.user_id')
            .where('a.id NOT IN (:ids)', { ids })
            .getRawMany();

        const res: AgencyRo[] = [];
        result.forEach(element => {
            const item = new AgencyRo();
            item.id = element.a_id;
            item.agencyName = element.a_agency_name;
            item.address = element.a_address;
            item.contract = element.a_contract;
            item.note = element.a_note;
            item.email = element.a_email;
            item.userId = element.u_id;
            item.phone = element.a_phone;
            item.userName = element.u_username;
            item.role = element.u_role;
            item.isAdmin = element.u_is_admin;
            res.push(item);
        });
        return res;
    }

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
}