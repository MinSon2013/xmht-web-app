import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ProductDTO } from './dto/modify-product.dto';
import { Product } from './entities/product.entity';
import { ProductRO } from './ro/product.ro';
import { ProductRepository } from './repository/product.repository';
import { ProductOrderRepository } from '../orders/repository/product-order.repository';
import { AgencyRepository } from '../agency/repository/agency.repository';
import { SearchOrderDTO } from '../orders/dto/search-order.dto';
import { ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../config/constant';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductsService {
  private readonly userRole: number[] = [ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE];

  constructor(
    public productRepo: ProductRepository,
    public productOrderRepo: ProductOrderRepository,
    public agencyRepository: AgencyRepository,
    public readonly userService: UserService,
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
    const user = await this.userService.getOne(body.userId);
    let agencyId = 0;
    if (!this.userRole.includes(user.role)) {
      const agency = await this.agencyRepository.getByUserId(body.userId);
      agencyId = agency.id;
    }
    return await this.productOrderRepo.sumProduct(body, agencyId);
  }
}
