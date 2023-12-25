import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserRoleDto } from './dto/user-role.dto';
import { UserRo } from './dto/user.ro';

@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<UserRo[]> {
    return this.userService.findUserRole()
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() user: UserRoleDto) {
    return this.userService.createUserRole(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() user: UserRoleDto) {
    return this.userService.updateUserRole(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.userService.deleteUserRole(id);
  }

}
