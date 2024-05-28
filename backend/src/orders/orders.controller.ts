import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ModifyOrderDTO } from './dto/modify-order.dto';
import { SearchOrderDTO } from './dto/search-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { DetailsOrderDTO } from './dto/details-order.dto';
import { OrderRO } from './ro/order.ro';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Get('/filters/:userId')
  filters(@Param('userId', ParseIntPipe) userId: number): Promise<Order[]> {
    return this.ordersService.filters(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list')
  findAll(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('take', ParseIntPipe) take: number,
    @Query('skip', ParseIntPipe) skip: number,
  ): Promise<OrderRO> {
    return this.ordersService.findAll(userId, take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/:userId')
  get(@Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,): Promise<any> {
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
  search(@Body() searchOderDto: SearchOrderDTO): Promise<OrderRO> {
    return this.ordersService.search(searchOderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/details')
  details(@Body() detailsOrderDto: DetailsOrderDTO): Promise<any> {
    return this.ordersService.details(detailsOrderDto);
  }
}
