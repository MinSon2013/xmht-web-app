import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AgencyService } from './agency.service';
import { ModifyAgencyDTO } from './dto/modify-agency.dto';
import { AgencyRO } from './ro/agency.ro';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':agencyId')
  get(@Param('agencyId', ParseIntPipe) agencyId: number): Promise<AgencyRO[]> {
    return this.agencyService.findAll(agencyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() modifyAgencyDto: ModifyAgencyDTO): Promise<AgencyRO> {
    return this.agencyService.create(modifyAgencyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyAgencyDto: ModifyAgencyDTO): Promise<UpdateResult> {
    return this.agencyService.update(modifyAgencyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/:userId')
  delete(@Param('id') id: number, @Param('userId') userId: number): Promise<DeleteResult> {
    return this.agencyService.delete(id, userId);
  }
}
