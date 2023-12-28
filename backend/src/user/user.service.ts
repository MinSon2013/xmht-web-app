import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Users } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserDTO } from './dto/user.dto';
import { UserDistrictRepository } from './repository/user-district.repository';
import { UserRO } from './ro/user.ro';

@Injectable()
export class UserService {

    constructor(private userRepo: UserRepository,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
        private userDistrictRepo: UserDistrictRepository,
    ) { }

    async findAll(): Promise<UserRO[]> {
        return await this.userRepo.getUserList();
    }

    //--- REMOVE ----
    async getAllUserList(): Promise<UserRO[]> {
        return await this.userRepo.getAllUserList();
    }

    async getOne(id: number): Promise<UserRO> {
        return await this.userRepo.getUserById(id);
    }

    async getDistrictByUserId(userId: number): Promise<number[]> {
        return await this.userDistrictRepo.getDistrictByUserId(userId);
    }

    async findByUsername(userName: string): Promise<Users> {
        return await this.userRepo.findOne({
            where: {
                userName
            },
        });
    }

    async createUser(user: UserDTO): Promise<UserRO> {
        return await this.userRepo.createUser(user, this.authService, this.userDistrictRepo);
    }

    async updateUser(user: UserDTO): Promise<UpdateResult> {
        return await this.userRepo.updateUser(user, this.authService, this.userDistrictRepo);
    }

    // async updateFullName(userId: number, name: string) {
    //     return await this.userRepo.updateFullName(userId, name);
    // }

    async updateUserPassword(id: number, password: string): Promise<UpdateResult> {
        return await this.userRepo.updatePassword(id, password, this.authService);
    }

    async deleteUser(id: number): Promise<DeleteResult> {
        return await this.userRepo.deleteUser(id);
    }

    async changeUserPassword(body: ChangePasswordDto) {
        return await this.userRepo.changeUserPassword(body.userId, body.oldPassword, body.newPassword, this.authService);
    }

    async changeAdminPassword(password: string) {
        return await this.authService.hashPassword(password);
    }

    // async deleteUserRole(id: number): Promise<DeleteResult> {
    //     const result = await this.userRepo.deleteUserRole(id, this.agencyService,);
    //     if (result) {
    //         await this.repo.deleteUserDistrict(id);
    //     }
    //     return result;
    // }


    // --- REMOVE --------------
    async syncUser(userId: number, fname: string, role: number) {
        return await this.userRepo.syncUser(userId, fname, role);
    }
}
