import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { NotificationService } from './notification.service';
import { NotificationDTO } from './dto/notification.dto';
import { NotificationAgencyDTO } from './dto/notification-agency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('notification')
@UseInterceptors(ClassSerializerInterceptor)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':agencyId')
  getAll(@Param('agencyId', ParseIntPipe) agencyId: number): Promise<any> {
    return this.notificationService.getAll(agencyId);
  }

  @Post('/badge')
  getBadge(@Body() body): Promise<any[]> {
    return this.notificationService.getBadgeNumber(Number(body.agencyId));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNotifyDto: NotificationDTO) {
    return this.notificationService.create(createNotifyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyNotifyDto: NotificationDTO) {
    return this.notificationService.update(modifyNotifyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.notificationService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/deleteall')
  deleteAll(@Body() body: any) {
    return this.notificationService.deleteMany(body.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/status')
  updateStatus(@Body() body: NotificationAgencyDTO) {
    return this.notificationService.updateIsView(body);
  }
}

