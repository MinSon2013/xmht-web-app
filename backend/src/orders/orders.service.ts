import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ModifyOrderDTO } from './dto/modify-order.dto';
import { Order } from './entities/order.entity';
import { SearchOrderDTO } from './dto/search-order.dto';
import { OrderRepository } from './repository/order.repository';
import { ProductsService } from '../products/products.service';
import { NotificationService } from '../notification/notification.service';
import { AgencyService } from '../agency/agency.service';
import { ProductOrderRepository } from './repository/product-order.repository';
import { UserService } from '../user/user.service';
import { ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../config/constant';

@Injectable()
export class OrdersService {
  private readonly userRole: number[] = [ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE];

  constructor(
    public readonly orderRepo: OrderRepository,
    private readonly productService: ProductsService,
    private readonly notificationService: NotificationService,
    private readonly agencyService: AgencyService,
    public readonly productOrderRepo: ProductOrderRepository,
    public readonly userService: UserService,
  ) { }

  async findAll(userId: number): Promise<Order[]> {
    const user = await this.userService.getOne(userId);
    let agencyId = 0;
    if (!this.userRole.includes(user.role)) {
      const agency = await this.agencyService.findOne(userId);
      agencyId = agency.id;
    }
    return await this.orderRepo.getOrderList(agencyId, this.productService, this.productOrderRepo);
  }

  async findOne(id: number, userId: number): Promise<Order> {
    const user = await this.userService.getOne(userId);
    let agencyId = 0;
    if (!this.userRole.includes(user.role)) {
      const agency = await this.agencyService.findOne(userId);
      agencyId = agency.id;
    }
    return await this.orderRepo.getOne(id, userId, agencyId, this.productService, this.productOrderRepo);
  }

  async create(modifyOrderDto: ModifyOrderDTO): Promise<ModifyOrderDTO> {
    return await this.orderRepo.createOrder(modifyOrderDto, this.notificationService, this.productOrderRepo);
  }

  async update(modifyOrderDto: ModifyOrderDTO): Promise<UpdateResult | any> {
    return await this.orderRepo.updateOrder(modifyOrderDto, this.notificationService, this.productOrderRepo);
  }

  async updateStatus(body: any) {
    return await this.orderRepo.updateStatus(body, this.notificationService);
  }

  async updateView(body: any) {
    return await this.orderRepo.updateView(body);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.orderRepo.deleteOrder(id, this.productOrderRepo);
  }

  async search(searchOderDto: SearchOrderDTO): Promise<Order[]> {
    const user = await this.userService.getOne(searchOderDto.userId);
    let agencyId = 0;
    if (!this.userRole.includes(user.role)) {
      const agency = await this.agencyService.findOne(searchOderDto.userId);
      agencyId = agency.id;
    }
    return await this.orderRepo.search(searchOderDto, this.productService, agencyId);
  }
}

