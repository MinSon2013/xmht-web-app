import { ClassSerializerInterceptor, Controller, Get, ParseIntPipe, Post, Put, StreamableFile, UseGuards } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { Query, Res, UploadedFile } from '@nestjs/common/decorators/http/route-params.decorator';
import LocalFilesInterceptor from '../config/local-files-interceptor';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('notifications')
@UseInterceptors(ClassSerializerInterceptor)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) { }

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
}

