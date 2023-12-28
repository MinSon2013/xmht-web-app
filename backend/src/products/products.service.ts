import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ProductDTO } from './dto/modify-product.dto';
import { Product } from './entities/product.entity';
import { ProductRO } from './ro/product.ro';
import { ProductRepository } from './repository/product.repository';
import { ProductOrderRepository } from '../orders/repository/product-order.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { SearchOrderDTO } from '../orders/dto/search-order.dto';

@Injectable()
export class ProductsService {
  constructor(
    public productRepo: ProductRepository,
    public productOrderRepo: ProductOrderRepository,
    public agencyRepository: AgencyRepository,
  ) { }

  async getAllProduct(): Promise<Product[]> {
    return await this.productRepo.getProducts();
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepo.getOne(id);
  }

  async create(createProductDto: ProductDTO): Promise<Product> {
    return await this.productRepo.createProduct(createProductDto)
  }

  async update(modifyProductDto: ProductDTO): Promise<UpdateResult> {
    return await this.productRepo.updateProduct(modifyProductDto);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.productRepo.deleteProduct(id);
  }

  async sum(body: SearchOrderDTO): Promise<ProductRO[]> {
    // const adminId = await this.agencyRepository.getAgencyIdOfAdmin();
    //const stockerId = await this.agencyRepository.getAgencyIdOfStocker();
    return await this.productOrderRepo.sumProduct(body);
  }
}
