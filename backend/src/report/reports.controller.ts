import { ClassSerializerInterceptor, Controller, Get, ParseIntPipe, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { Query, Res, UploadedFile } from '@nestjs/common/decorators/http/route-params.decorator';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ReportService } from './report.service';
import LocalFilesInterceptor from '../config/local-files-interceptor';

@Controller('reports')
@UseInterceptors(ClassSerializerInterceptor)
export class ReportsController {
  constructor(private readonly reportService: ReportService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  @UseInterceptors(LocalFilesInterceptor({
    fieldName: 'file',
    path: '/reports',
    limits: {
      fileSize: Math.pow(1024, 2)
    }
  }))
  uploadFile(@Query('reportId', ParseIntPipe) reportId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.reportService.uploadFile(reportId, {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/download')
  async downloadFileById(
    @Query('reportId', ParseIntPipe) reportId: number,
    @Res({ passthrough: true }) response: Response) {
    const row = await this.reportService.getFileById(reportId);
    if (row.filePath.length > 0) {
      const stream = createReadStream(join(process.cwd(), row.filePath));
      response.set({
        'Content-Disposition': `inline; filename="${row.attachFile}"`,
        'Content-Type': row.mimeType,
      })
      return new StreamableFile(stream);
    }
    return { statusCode: 400, message: 'File not found.' };
  }
}