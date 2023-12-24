import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Users } from '../entities/user.entity'
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { UserRoleDto } from '../dto/user-role.dto';
import { UserDistrict } from '../entities/user-district.entity';
import { AgencyService } from '../../agency/agency.service';
import { UserDistrictRepository } from './user-district.repository';
import { UserRo } from '../dto/user.ro';
import { Agency } from '../../agency/entities/agency.entity';

@EntityRepository(Users)
export class UserRepository extends Repository<Users> {

    constructor() {
        super();
    }

    async getAll(): Promise<Users[]> {
        return await this.find();
    }

    async getUserRole(): Promise<UserRo[]> {
        const sql = this.createQueryBuilder('u')
            .leftJoinAndSelect(UserDistrict, 'ud', 'ud.user_id = u.id')
            .leftJoinAndSelect(Agency, 'a', 'a.user_id = u.id')
            .where('u.role > 0')
            .orderBy('u.id', 'DESC');
        const raw = await sql.getRawMany();

        const result: UserRo[] = [];
        raw.forEach(element => {
            const item: UserRo = {
                id: element.u_id,
                username: element.u_username,
                isAdmin: element.u_is_admin,
                role: element.u_role,
                districtId: element.ud_district_id,
                fullName: element.a_full_name,
            };
            result.push(item);
        });

        return result;
    }

    async getOne(id: number): Promise<Users> {
        return await this.findOne({
            where: {
                id
            },
        });
    }

    async getByNamePassword(username: string, password: string) {
        return await this.createQueryBuilder()
            .where("username = :username", { username })
            .execute()
    }

    async createUser(newUser: Users | any, authService: AuthService): Promise<Users> {
        try {
            const exists: boolean = await this.usernameExists(newUser.username);
            if (!exists) {
                const passwordHash: string = await authService.hashPassword(newUser.password);
                newUser.password = passwordHash;
                const user = await this.save(newUser);
                return this.findOne(user.id);
            } else {
                throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
            }
        } catch {
            throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
        }
    }

    async createUserRole(userDto: UserRoleDto,
        authService: AuthService,
        agencyService: AgencyService,
        repo: UserDistrictRepository): Promise<Users> {
        try {
            const exists: boolean = await this.usernameExists(userDto.username);
            if (!exists) {
                const passwordHash: string = await authService.hashPassword(userDto.password);
                userDto.password = passwordHash;
                const userEntity = new Users();
                userEntity.isAdmin = userDto.isAdmin;
                userEntity.password = userDto.password;
                userEntity.username = userDto.username;
                userEntity.role = userDto.role;
                userEntity.isStocker = userDto.role === 1 ? true : false;
                const user = await this.save(userEntity);

                // Create agency for user
                await agencyService.createAgencyForUserRole(user.id, userDto.fullName);

                // Create user-district
                await repo.createUserDistrict(user.id, userDto.districtId);

                return this.findOne(user.id);
            } else {
                throw new HttpException('Username is already in use', HttpStatus.CONFLICT);
            }
        } catch {
            throw new HttpException('Username is already in use', HttpStatus.CONFLICT);
        }
    }

    async updateUserRole(userDto: UserRoleDto,
        authService: AuthService,
        agencyService: AgencyService,
        repo: UserDistrictRepository): Promise<Users | any> {
        try {
            const res = await this.createQueryBuilder()
                .update(Users)
                .set({ role: userDto.role })
                .where("id = :id", { id: userDto.id })
                .execute();

            // Update agency for user
            await agencyService.updateAgencyForUserRole(userDto.id, userDto.fullName);

            // Update user-district
            await repo.updateUserDistrict(userDto.id, userDto.districtId);

            return res;
        } catch {
            throw new HttpException('Error update userrole', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePassword(id: number, password: string, authService: AuthService): Promise<UpdateResult> {
        const passwordHash: string = await authService.hashPassword(password);
        return await this.createQueryBuilder()
            .update(Users)
            .set({ password: passwordHash })
            .where("id = :id", { id })
            .execute()
    }

    async deleteUser(id: number): Promise<DeleteResult> {
        return await this.delete(id);
    }

    private async usernameExists(username: string): Promise<boolean> {
        const user = await this.findOne({ username });
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    async changeUserPassword(userId: number, oldPassword: string, newPassword: string, authService: AuthService): Promise<UpdateResult> {
        const foundUser: Users = await this.getOne(userId);
        if (foundUser) {
            const matches: boolean = await authService.validatePassword(oldPassword, foundUser.password);
            if (matches) {
                const newPasswordHash: string = await authService.hashPassword(newPassword);
                return await this.createQueryBuilder()
                    .update(Users)
                    .set({ password: newPasswordHash })
                    .where("id = :userId", { userId })
                    .execute();
            } else {
                throw new HttpException('OldPassword is wrong', HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
    }

}