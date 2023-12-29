import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ModifyOrderDTO } from './dto/modify-order.dto';
import { SearchOrderDTO } from './dto/search-order.dto';
//import { StatisticsDto } from './dto/statistics.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  findAll(@Param('userId', ParseIntPipe) userId: number): Promise<Order[]> {
    return this.ordersService.findAll(userId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('/statistics')
  // getDataByMonthYear(@Body() body: StatisticsDto) {
  //   return this.ordersService.findByMonthYear(body);
  // }

  @UseGuards(JwtAuthGuard)
  @Get(':id/:userId')
  get(@Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,): Promise<Order> {
    return this.ordersService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOderDto: ModifyOrderDTO) {
    return this.ordersService.create(createOderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyProductDto: ModifyOrderDTO) {
    return this.ordersService.update(modifyProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/status')
  updateStatus(@Body() body) {
    return this.ordersService.updateStatus(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/view')
  updateView(@Body() body) {
    return this.ordersService.updateView(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.ordersService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/search')
  search(@Body() searchOderDto: SearchOrderDTO): Promise<Order[]> {
    return this.ordersService.search(searchOderDto);
  }
}
