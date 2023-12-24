import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Users } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRoleDto } from './dto/user-role.dto';
import { AgencyService } from '../agency/agency.service';
import { UserDistrictRepository } from './repository/user-district.repository';
import { UserRo } from './dto/user.ro';

@Injectable()
export class UserService {

    constructor(private userRepo: UserRepository,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
        @Inject(forwardRef(() => AgencyService))
        private readonly agencyService: AgencyService,
        private repo: UserDistrictRepository,
    ) { }

    async findAll(): Promise<Users[]> {
        return await this.userRepo.getAll();
    }

    async getOne(id: number): Promise<Users> {
        return await this.userRepo.getOne(id);
    }

    async findByUsername(username: string): Promise<Users> {
        return await this.userRepo.findOne({
            where: {
                username
            },
        });
    }

    async createUser(user: Users | any): Promise<Users> {
        return await this.userRepo.createUser(user, this.authService)
    }

    async updateUserPassword(id: number, password: string): Promise<UpdateResult> {
        return await this.userRepo.updatePassword(id, password, this.authService);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.userRepo.deleteUser(id);
    }

    async changeUserPassword(body: ChangePasswordDto) {
        return await this.userRepo.changeUserPassword(body.userId, body.oldPassword, body.newPassword, this.authService);
    }

    async changeAdminPassword(password: string) {
        return await this.authService.hashPassword(password);
    }

    async findUserRole(): Promise<UserRo[]> {
        return await this.userRepo.getUserRole();
    }

    async createUserRole(user: UserRoleDto): Promise<Users> {
        return await this.userRepo.createUserRole(user, this.authService, this.agencyService, this.repo);
    }

    async updateUserRole(user: UserRoleDto): Promise<Users> {
        return await this.userRepo.updateUserRole(user, this.authService, this.agencyService, this.repo);
    }

    async deleteUserRole(id: number): Promise<DeleteResult> {
        const result = await this.userRepo.deleteUser(id);
        if (result) {
            await this.repo.deleteUserDistrict(id);
        }
        return result;
    }
}
