import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { DistrictService } from './district.service';
import { District } from './entities/district.entity';
import { ModifyDistrictDto } from './dto/modify-district.dto';

@Controller('district')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<District[]> {
    return this.districtService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<District> {
    return this.districtService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() modifyDistrictDto: ModifyDistrictDto) {
    return this.districtService.create(modifyDistrictDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyDistrictDto: ModifyDistrictDto) {
    return this.districtService.update(modifyDistrictDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.districtService.delete(id);
  }
}
