import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ModifyStoreDto } from './dto/modify-store.dto';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/:agencyId')
  getAll(@Param('userId', ParseIntPipe) userId: number,
    @Param('agencyId', ParseIntPipe) agencyId: number): Promise<any> {
    return this.storeService.findAll(userId, agencyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Store> {
    return this.storeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() modifyStoreDto: ModifyStoreDto) {
    return this.storeService.create(modifyStoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyStoreDto: ModifyStoreDto) {
    return this.storeService.update(modifyStoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.storeService.delete(id);
  }
}
