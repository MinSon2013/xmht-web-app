import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Put, StreamableFile, UseGuards } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { Query, Req, Res, UploadedFile } from '@nestjs/common/decorators/http/route-params.decorator';
import LocalFilesInterceptor from '../config/local-files-interceptor';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/notification.dto';
import { NotificationAgencyDto } from './dto/notification-agency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('notification')
@UseInterceptors(ClassSerializerInterceptor)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<any> {
    return this.notificationService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':agencyId/:isAdmin')
  getAll(@Param('agencyId', ParseIntPipe) agencyId: number,
    @Param('isAdmin', ParseBoolPipe) isAdmin: boolean,
  ): Promise<any> {
    return this.notificationService.getAll(agencyId, isAdmin);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('/badge')
  getBadge(@Body() body): Promise<any[]> {
    return this.notificationService.getBadgeNumber(Number(body.agencyId));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNotifyDto: NotificationDto) {
    return this.notificationService.create(createNotifyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  @UseInterceptors(LocalFilesInterceptor({
    fieldName: 'file',
    path: '/notification',
    limits: {
      fileSize: Math.pow(1024, 2)
    }
  }))
  uploadFile(@Query('notifyId', ParseIntPipe) notifyId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.notificationService.uploadFile(notifyId, {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyNotifyDto: NotificationDto) {
    return this.notificationService.update(modifyNotifyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.notificationService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/download')
  async downloadFileById(
    @Query('notifyId', ParseIntPipe) notifyId: number,
    @Res({ passthrough: true }) response: Response) {
    const row = await this.notificationService.getFileById(notifyId);
    if (row.filePath.length > 0) {
      const stream = createReadStream(join(process.cwd(), row.filePath));
      response.set({
        'Content-Disposition': `inline; filename="${row.fileName}"`,
        'Content-Type': row.mimeType,
      })
      return new StreamableFile(stream);
    }
    return { statusCode: 400, message: 'File not found.' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/status')
  updateStatus(@Body() body: NotificationAgencyDto) {
    return this.notificationService.updateIsView(body);
  }
}

