import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Agency } from '../entities/agency.entity';
import { ModifyAgencyDto } from '../dto/modify-agency.dto';
import { UserService } from '../../user/user.service';
import { Users } from '../../user/entities/user.entity';
import { AuthService } from '../../auth/auth.service';

@EntityRepository(Agency)
export class AgencyRepository extends Repository<Agency> {

    constructor() {
        super();
    }

    async findAll(): Promise<Agency[]> {
        return await this.find();
    }

    async getOne(userId: number): Promise<Agency> {
        return await this.findOne({
            where: {
                userId
            },
        })
    }

    async getAgencyName(id: number): Promise<string> {
        const agency = await this.findOne({
            where: {
                id
            },
        })

        if (agency) {
            return agency.fullName;
        }

        return '';
    }

    async createAgency(modifyAgencyDto: ModifyAgencyDto, userService: UserService): Promise<Agency> {
        const userEntity = {
            username: modifyAgencyDto.accountName,
            password: modifyAgencyDto.password,
            isAdmin: false,
            token: '',
            expiresAt: 0
        }
        const user = await userService.createUser(userEntity);

        const agencyEntity = this.mappingAgency(modifyAgencyDto);
        agencyEntity.userId = user.id;
        const agency = await this.save(agencyEntity);
        return agency;
    }

    async updateAgency(modifyAgencyDto: ModifyAgencyDto,
        authService: AuthService,
        userService: UserService
    ): Promise<UpdateResult> {
        const agency = this.mappingAgency(modifyAgencyDto);
        const user: Users = await userService.getOne(modifyAgencyDto.userId);
        if (modifyAgencyDto.password !== user.password) {
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

    public async getAgencyIdOfStocker() {
        const stocker = await this.createQueryBuilder()
            .select('a.id as agencyId')
            .from(Agency, 'a')
            .innerJoin(Users, 'u', 'u.id = a.user_id')
            .where('u.is_stocker IS TRUE')
            .getRawOne();
        return stocker.agencyId;
    }

    private mappingAgency(modifyAgencyDto: ModifyAgencyDto): Agency {
        const agency = new Agency();
        agency.fullName = modifyAgencyDto.fullName;
        agency.address = modifyAgencyDto.address;
        agency.contract = modifyAgencyDto.contract;
        agency.note = modifyAgencyDto.note;
        agency.email = modifyAgencyDto.email;
        agency.userId = modifyAgencyDto.userId;
        agency.phone = modifyAgencyDto.phone;
        return agency;
    }

    async createAgencyForUserRole(userId: number, name: string): Promise<Agency> {
        const agencyEntity = new Agency();
        agencyEntity.userId = userId;
        agencyEntity.fullName = name;
        const agency = await this.save(agencyEntity);
        return agency;
    }

    async updateAgencyForUserRole(userId: number, name: string): Promise<any> {
        return await this.createQueryBuilder()
            .update(Agency)
            .set({ fullName: name })
            .where("user_id = :userId", { userId })
            .execute();
    }
}