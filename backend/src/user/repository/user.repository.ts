import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Users } from '../entities/user.entity'
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { UserDTO } from '../dto/user.dto';
import { UserDistrict } from '../entities/user-district.entity';
import { UserDistrictRepository } from './user-district.repository';
import { UserRO } from '../ro/user.ro';
import { Helper } from '../../shared/helper';

@EntityRepository(Users)
export class UserRepository extends Repository<Users> {
    private readonly OPTIONS = 'changePassword';
    private readonly helper = new Helper();

    constructor() {
        super();
    }

    //--- REMOVE ---------
    async getAllUserList(): Promise<UserRO[]> {
        const raw = await this.createQueryBuilder('u')
            .leftJoinAndSelect(UserDistrict, 'ud', 'ud.user_id = u.id')
            .orderBy('u.id', 'ASC')
            .getRawMany();

        return this.mappingUserRO(raw);
    }

    async getUserList(): Promise<UserRO[]> {
        const raw = await this.createQueryBuilder('u')
            .leftJoinAndSelect(UserDistrict, 'ud', 'ud.user_id = u.id')
            .where('u.is_admin IS FALSE')
            .orderBy('u.id', 'DESC')
            .getRawMany();

        return this.mappingUserRO(raw);
    }

    async getUserById(id: number, options?: string): Promise<UserRO> {
        const raw = await this.createQueryBuilder('u')
            .leftJoinAndSelect(UserDistrict, 'ud', 'ud.user_id = u.id')
            .where('u.id = :id', { id })
            .getRawOne();

        return this.mappingUserRO([raw], options)[0];
    }

    private mappingUserRO(raw: any, options?: string): UserRO[] {
        const result: UserRO[] = [];
        raw.forEach(element => {
            const item: UserRO = {
                id: element.u_id,
                userName: element.u_username,
                role: element.u_role,
                districtId: element.ud_district_id,
                fullName: element.u_full_name,
                password: options ? element.u_password : '',
                isAdmin: element.u_is_admin,
            };
            result.push(item);
        });
        return result;
    }

    // async createUser_1(newUser: Users | any, authService: AuthService): Promise<Users> {
    //     try {
    //         const exists: boolean = await this.usernameExists(newUser.username);
    //         if (!exists) {
    //             const passwordHash: string = await authService.hashPassword(newUser.password);
    //             newUser.password = passwordHash;
    //             const user = await this.save(newUser);
    //             return this.findOne(user.id);
    //         } else {
    //             throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    //         }
    //     } catch {
    //         throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    //     }
    // }

    async createUser(userDto: UserDTO, authService: AuthService, userDistrictRepo: UserDistrictRepository): Promise<UserRO> {
        try {
            const exists: boolean = await this.usernameExists(userDto.userName);
            if (!exists) {
                const passwordHash: string = await authService.hashPassword(userDto.password);
                //userDto.password = passwordHash;------

                const entity = new Users();
                entity.isAdmin = false;
                entity.userName = userDto.userName;
                entity.password = passwordHash;
                entity.fullName = userDto.fullName;
                entity.role = userDto.role;
                entity.updatedDate = this.helper.getUpdateDate(2);
                entity.updatedByUserId = userDto.updatedByUserId;
                const user = await this.save(entity);

                // Create user-district
                await userDistrictRepo.createUserDistrict(user.id, userDto.districtId);

                return await this.getUserById(user.id);
            } else {
                throw new HttpException('Username is already in user', HttpStatus.BAD_GATEWAY);
            }
        } catch {
            throw new HttpException('Username is already in user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateUser(userDto: UserDTO, authService: AuthService, userDistrictRepo: UserDistrictRepository): Promise<UpdateResult> {
        try {
            const entity = new Users();
            let result;
            const exists: boolean = await this.usernameExists(userDto.userName);
            if (!exists) {
                if (userDto.password.length > 0) {
                    const passwordHash: string = await authService.hashPassword(userDto.password);
                    entity.password = passwordHash;
                }
                entity.fullName = userDto.fullName;
                entity.role = userDto.role;
                entity.updatedDate = this.helper.getUpdateDate(2);
                entity.updatedByUserId = userDto.updatedByUserId;

                result = await this.update(userDto.id, entity);
            }

            // const res = await this.createQueryBuilder()
            //     .update(Users)
            //     .set({ role: userDto.role })
            //     .where("id = :id", { id: userDto.id })
            //     .execute();

            // // // Update agency for user
            // // await agencyService.updateAgencyForUserRole(userDto.id, userDto.fullName);

            // Update user-district
            await userDistrictRepo.updateUserDistrict(userDto.id, userDto.districtId);

            return result;
        } catch {
            throw new HttpException('Exception update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async updateFullName(id: number, name: string) {
    //     return await this.createQueryBuilder()
    //         .update(Users)
    //         .set({ fullName: name })
    //         .where("id = :id", { id })
    //         .execute();
    // }

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

    private async usernameExists(userName: string): Promise<boolean> {
        const user = await this.findOne({
            where: {
                userName
            }
        });
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    async changeUserPassword(userId: number, oldPassword: string, newPassword: string, authService: AuthService): Promise<UpdateResult> {
        const foundUser = await this.getUserById(userId, this.OPTIONS);
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

    // REMOVE -----------------------------------
    // Sync database
    async syncUser(userId: number, fname: string, role: number) {
        try {
            if (role > 0) {
                return await this.createQueryBuilder('u').update()
                    .set({ fullName: fname, role: role })
                    .where("id = :userId", { userId })
                    .execute();
            } else {
                return await this.createQueryBuilder()
                    .update()
                    .set({ fullName: fname })
                    .where("id = :userId", { userId })
                    .execute();
            }
        } catch (err) {
            console.log(err)
        }

    }

}