import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ReportService } from './report.service';
import { Reports } from './entities/report.entity';
import { ModifyReportDTO } from './dto/modify-report.dto';
import { SearchDTO } from './dto/search.dto';

@Controller('report')
@UseInterceptors(ClassSerializerInterceptor)
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getAll(@Param('userId', ParseIntPipe) userId: number): Promise<any> {
    return this.reportService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Reports> {
    return this.reportService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() modifyReportDto: ModifyReportDTO) {
    return this.reportService.create(modifyReportDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyReportDto: ModifyReportDTO) {
    return this.reportService.update(modifyReportDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.reportService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/search')
  search(@Body() searchDto: SearchDTO): Promise<Reports[]> {
    return this.reportService.search(searchDto);
  }
}
