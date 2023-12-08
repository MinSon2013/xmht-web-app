import { forwardRef, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DeliveryService } from "../delivery/delivery.service";
import { AgencyService } from "../agency/agency.service";
import { MenuService } from "../menu/menu.service";
import { UserService } from "../user/user.service";
import { AuthDto } from "./dto/auth.dto";
import { ProductsService } from "../products/products.service";
import bcrypt from 'bcrypt';
import { Users } from "../user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Inject } from "@nestjs/common/decorators";
import { Agency } from "../agency/entities/agency.entity";

@Injectable()
export class AuthService {
    jwtSecret: string = 'SECRET_STRING';

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly menuService: MenuService,
        @Inject(forwardRef(() => AgencyService))
        private readonly agencyService: AgencyService,
        private readonly deliveryService: DeliveryService,
        private readonly productService: ProductsService,
        private readonly jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async getDataToResponse(user: Users, jwt: string) {
        const menuList = await this.menuService.findAll(user.isAdmin || user.isStocker);
        let userList = await this.userService.findAll();
        const deliveryList = await this.deliveryService.findAll();
        let agencyList = await this.agencyService.findAll();
        const agency = await this.agencyService.findOne(user.id);
        const productList = await this.productService.getAllProduct();
        const admin = userList.find(x => x.isAdmin === true);
        const stocker = userList.find(x => x.isStocker === true);
        if (!user.isAdmin && !user.isStocker) {
            agencyList = [agencyList.find(x => x.userId !== admin.id && x.userId !== stocker.id && x.userId === user.id)];
            userList = userList.filter(x => x.isAdmin === false && x.isStocker === false && x.id === user.id);
        } else {
            agencyList = agencyList.filter(x => x.userId !== admin.id && x.userId !== stocker.id);
            userList = userList.filter(x => x.isAdmin === false && x.isStocker === false);
        }
        return {
            loginInfo: {
                userId: user.id,
                userName: user.username,
                isAdmin: user.isAdmin,
                accountName: agency ? agency.fullName : '',
                agencyId: agency ? agency.id : 0,
                isStocker: user.isStocker,
            },
            menuList,
            userList,
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

    async login(user: AuthDto) {
        const foundUser: Users = await this.userService.findByUsername(user.username);
        if (foundUser) {
            const matches: boolean = await this.validatePassword(user.password, foundUser.password);
            if (matches) {
                const payload: Users = await this.userService.getOne(foundUser.id);
                delete payload.password;
                const agency: Agency = await this.agencyService.findOne(foundUser.id);

                const jwt = await this.generateJwt({ ...payload, agencyId: agency.id });
                return await this.getDataToResponse(foundUser, jwt);
            } else {
                throw new HttpException('Login was not successfull, wrong credentials', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('Login was not successfull, User not found', HttpStatus.NOT_FOUND);
        }
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
}