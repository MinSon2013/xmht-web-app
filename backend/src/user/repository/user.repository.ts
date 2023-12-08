import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { Users } from '../entities/user.entity'
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@EntityRepository(Users)
export class UserRepository extends Repository<Users> {
    
    constructor( ){
        super();
    }

    async getAll(): Promise<Users[]> {
        return await this.find();
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