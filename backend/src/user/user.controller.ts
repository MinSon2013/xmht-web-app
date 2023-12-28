import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRO } from './ro/user.ro';
import { UserDTO } from './dto/user.dto';
import { UpdateResult } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<UserRO[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<UserRO> {
    return this.userService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() user: UserDTO): Promise<UserRO> {
    return this.userService.createUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() user: UserDTO): Promise<UpdateResult> {
    return this.userService.updateUser(user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put()
  // updatePassword(@Body() user: UserDTO) {
  //   return this.userService.updateUserPassword(user.id, user.password);
  // }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
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
