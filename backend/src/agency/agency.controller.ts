import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AgencyService } from './agency.service';
import { ModifyAgencyDto } from './dto/modify-agency.dto';
import { Agency } from './entities/agency.entity';

@Controller('agency')
export class AgencyController {
    constructor(private readonly agencyService: AgencyService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(): Promise<Agency[]> {
      return this.agencyService.findAll()
    }
  
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    get(@Param('id', ParseIntPipe) id: number): Promise<Agency> {
      return this.agencyService.findOne(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() modifyAgencyDto: ModifyAgencyDto) {
      return this.agencyService.create(modifyAgencyDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put()
    update(@Body() modifyAgencyDto: ModifyAgencyDto) {
      return this.agencyService.update(modifyAgencyDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: number) {
      return this.agencyService.delete(id);
    }
}
