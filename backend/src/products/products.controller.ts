import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ProductDto } from './dto/modify-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductRo } from './ro/product.ro';
import { SearchOrderDto } from '../orders/dto/search-order.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Product[]> {
    return this.productService.getAllProduct();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/sum')
  sumAll(@Body() body: SearchOrderDto): Promise<ProductRo[]> {
    return this.productService.sum(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: ProductDto) {
    return this.productService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyProductDto: ProductDto) {
    return this.productService.update(modifyProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.productService.delete(id);
  }
}
