import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Users } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserDTO } from './dto/user.dto';
import { UserDistrictRepository } from './repository/user-district.repository';
import { UserRO } from './ro/user.ro';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../config/constant';

@Injectable()
export class UserService {
    private readonly userRole: number[] = [ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE];

    constructor(private userRepo: UserRepository,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
        private userDistrictRepo: UserDistrictRepository,
        public readonly agencyRepo: AgencyRepository,
    ) { }

    async findAll(userId: number): Promise<UserRO[]> {
        const user = await this.getOne(userId);
        if (user && [ADMIN_ROLE, STOCKER_ROLE].includes(user.role)) {
            return await this.userRepo.getUserList();
        }
        return [user];
    }

    //--- REMOVE ----
    async getAllUserList(): Promise<UserRO[]> {
        return await this.userRepo.getAllUserList();
    }

    async getOne(id: number): Promise<UserRO> {
        return await this.userRepo.getUserById(id);
    }

    async getUserPassword(userId: number): Promise<string> {
        return await this.userRepo.getUserPasswordById(userId);
    }

    async getDistrictByUserId(userId: number): Promise<number> {
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
        if (user.password) {
            const password = await this.getUserPassword(user.id);
            const matches: boolean = await this.authService.validatePassword(user.password, password);
            if (!matches) {
                await this.updateUserPassword(user.id, user.password);
            }
        }
        return await this.userRepo.updateUser(user, this.authService, this.userDistrictRepo);
    }

    async updateUserPassword(id: number, password: string): Promise<UpdateResult> {
        return await this.userRepo.updatePassword(id, password, this.authService);
    }

    async deleteUser(id: number): Promise<DeleteResult> {
        const user = await this.getOne(id);
        if (user && !this.userRole.includes(user.role)) {
            await this.agencyRepo.deleteAgencyByUserId(id);
        }
        return await this.userRepo.deleteUser(id);
    }

    async changeUserPassword(body: ChangePasswordDto) {
        return await this.userRepo.changeUserPassword(body.userId, body.oldPassword, body.newPassword, this.authService);
    }

    async changeAdminPassword(password: string) {
        return await this.authService.hashPassword(password);
    }

    // --- REMOVE --------------
    async syncUser(userId: number, fname: string, role: number) {
        return await this.userRepo.syncUser(userId, fname, role);
    }
}
