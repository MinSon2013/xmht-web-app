import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Users } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Users[]> {
    return this.userService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Users> {
    return this.userService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() user: Users) {
    return this.userService.createUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updatePassword(@Body() user: Users) {
    return this.userService.updateUserPassword(user.id, user.password);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.userService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('changepassword')
  changePassword(@Body() body: ChangePasswordDto) {
    return this.userService.changeUserPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change/password/admin')
  changePasswordAdmin(@Body() body: any) {
    return this.userService.changeAdminPassword(body.password);
  }

}
