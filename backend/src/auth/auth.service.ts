import { forwardRef, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DeliveryService } from "../delivery/delivery.service";
import { AgencyService } from "../agency/agency.service";
import { UserService } from "../user/user.service";
import { AuthDto } from "./dto/auth.dto";
import { ProductsService } from "../products/products.service";
import bcrypt from 'bcrypt';
import { Users } from "../user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Inject } from "@nestjs/common/decorators";
import { ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from "../config/constant";
import { UserRO } from "../user/ro/user.ro";
import { AgencyRO } from "../agency/ro/agency.ro";

@Injectable()
export class AuthService {
    jwtSecret: string = 'SECRET_STRING';
    userRole: number[] = [ADMIN_ROLE, STOCKER_ROLE, USER_SALESMAN_ROLE, USER_AREA_MANAGER_ROLE];

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => AgencyService))
        private readonly agencyService: AgencyService,
        private readonly deliveryService: DeliveryService,
        private readonly productService: ProductsService,
        private readonly jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(user: AuthDto) {
        // // -- REMOVE ----
        await this.syncDatabase(); //mapping data from agency to user

        // const foundUser: Users = await this.userService.findByUsername(user.username);
        // if (foundUser) {
        //     const matches: boolean = await this.validatePassword(user.password, foundUser.password);
        //     if (matches) {
        //         const payload: UserRO = await this.userService.getOne(foundUser.id);
        //         delete payload.password;

        //         let agencyId = 0;
        //         if (!this.userRole.includes(payload.role)) {
        //             const agency: AgencyRO = await this.agencyService.findOne(foundUser.id);
        //             agencyId = agency.id;
        //         }

        //         const jwt = await this.generateJwt({ ...payload, agencyId });
        //         return await this.getDataToResponse(foundUser, jwt);
        //     } else {
        //         throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
        //     }
        // } else {
        //     throw new HttpException('Login was not successfull, User not found', HttpStatus.NOT_FOUND);
        // }
    }

    private async getDataToResponse(user: Users, jwt: string) {
        const deliveryList = await this.deliveryService.findAll();
        const productList = await this.productService.getAllProduct();
        let agencyList;
        let agencyId = 0;
        let agencyName = '';
        if (!user.isAdmin && !this.userRole.includes(user.role)) {
            const agency = await this.agencyService.findOne(user.id);
            agencyId = agency.id;
            agencyName = agency.agencyName;
            agencyList = await this.agencyService.findAll(agencyId);
        } else {
            agencyList = await this.agencyService.findAll(0);
        }
        return {
            loginInfo: {
                userId: user.id,
                userName: user.userName,
                isAdmin: user.isAdmin,
                fullName: user.fullName,
                userRole: user.role,
                agencyId: agencyId,
                agencyName: agencyName,
            },
            deliveryList,
            agencyList,
            productList,
            accessToken: jwt,
            tokenType: 'JWT',
            expiresIn: 10000,
            statusCode: HttpStatus.OK,
            message: '',
        };
    }

    public async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
        return this.comparePasswords(password, storedPasswordHash);
    }

    async generateJwt(user: Users | any): Promise<string> {
        return await this.jwtService.signAsync({ user }, {
            secret: this.configService.get('JWT_SECRET_KEY'),
            privateKey: this.configService.get('JWT_SECRET_KEY'),
            expiresIn: '365d',
        });
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    async comparePasswords(password: string, storedPasswordHash: string): Promise<any> {
        return bcrypt.compare(password, storedPasswordHash);
    }

    verifyJwt(jwt: string): Promise<any> {
        return this.jwtService.verifyAsync(jwt, { secret: this.configService.get('JWT_SECRET_KEY') });
    }

    async authentication(username: string, password: string): Promise<any> {
        let check = false;
        const user = await this.userService.findByUsername(username);
        if (user) {
            check = await this.comparePasswords(password, user.password);
        }

        if (!user || !check) {
            return false;
        }

        return user;
    }



    // -- REMOVE ----------------------------------------------------------------
    async syncDatabase() {
        // get agency list
        const agencyListNotUser = await this.agencyService.getAgencyList();
        const agencyListUser = await this.agencyService.getUserNotAgency();

        // get user list
        const userList = await this.userService.getAllUserList();

        try {
            for (let el of userList) {
                // Update user-role, full-name for agency in `users`
                const f = agencyListNotUser.find(x => x.userId === el.id);
                if (f) {
                    await this.userService.syncUser(el.id, f.agencyName, 4);
                }

                // Update full-name for user in `users`
                const ff = agencyListUser.find(y => y.userId === el.id);
                if (ff) {
                    // delete admin, thukho khoi agency
                    await this.userService.syncUser(el.id, ff.agencyName, 0);
                    await this.agencyService.deleteSync(ff.id);
                }
            }

        } catch (err) {
            throw new HttpException('sync fail', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}