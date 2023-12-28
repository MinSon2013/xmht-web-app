import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ProductDTO } from './dto/modify-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductRO } from './ro/product.ro';
import { SearchOrderDTO } from '../orders/dto/search-order.dto';

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
  sumAll(@Body() body: SearchOrderDTO): Promise<ProductRO[]> {
    return this.productService.sum(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: ProductDTO) {
    return this.productService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() modifyProductDto: ProductDTO) {
    return this.productService.update(modifyProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.productService.delete(id);
  }
}
