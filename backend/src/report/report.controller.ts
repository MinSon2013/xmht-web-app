import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ReportService } from './report.service';
import { Reports } from './entities/report.entity';
import { ModifyReportDto } from './dto/modify-report.dto';
import { SearchDto } from './dto/search.dto';

@Controller('report')
@UseInterceptors(ClassSerializerInterceptor)
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/:agencyId')
  getAll(@Param('userId', ParseIntPipe) userId: number,
    @Param('agencyId', ParseIntPipe) agencyId: number): Promise<any> {
    return this.reportService.findAll(userId, agencyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Reports> {
    return this.reportService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() modifyReportDto: ModifyReportDto) {
    return this.reportService.create(modifyReportDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyReportDto: ModifyReportDto) {
    return this.reportService.update(modifyReportDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.reportService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/search')
  search(@Body() searchDto: SearchDto): Promise<Reports[]> {
    return this.reportService.search(searchDto);
  }
}
