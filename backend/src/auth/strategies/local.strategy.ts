import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Users } from "../../user/entities/user.entity";
import { AuthService } from "../auth.service";
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(username: string, password: string): Promise<Users> {
        const user = await this.authService.authentication(username, password);
        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}