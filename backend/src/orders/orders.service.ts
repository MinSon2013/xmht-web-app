import { Injectable } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ModifyOrderDto } from './dto/modify-order.dto';
import { Order } from './entities/order.entity';
import { SearchOrderDto } from './dto/search-order.dto';
import { StatisticsDto } from './dto/statistics.dto';
import { OrderRepository } from './repository/order.repository';
import { ProductsService } from '../products/products.service';
import { NotificationService } from '../notification/notification.service';
import { AgencyService } from '../agency/agency.service';
import { ProductOrderRepository } from './repository/product-order.repository';

@Injectable()
export class OrdersService {

  constructor(
    public readonly orderRepo: OrderRepository,
    private readonly productService: ProductsService,
    private readonly notificationService: NotificationService,
    private readonly agencyService: AgencyService,
    public readonly productOrderRepo: ProductOrderRepository,
  ) { }

  async findAll(userId: number): Promise<Order[]> {
    const adminId = await this.adminId();
    const stockerId = await this.stockerId();
    return await this.orderRepo.getOrderList(userId, this.productService, this.productOrderRepo, adminId, stockerId);
  }

  async findByMonthYear(body: StatisticsDto) {
    const adminId = await this.adminId();
    body.adminId = adminId;
    body.stockerId = await this.stockerId();
    return await this.orderRepo.findByMonthYear(body);
  }

  async findOne(id: number, userId: number): Promise<Order> {
    const adminId = await this.adminId();
    const stockerId = await this.stockerId();
    return await this.orderRepo.getOne(id, userId, this.productService, this.productOrderRepo, adminId, stockerId);
  }

  async create(modifyOrderDto: ModifyOrderDto): Promise<ModifyOrderDto> {
    modifyOrderDto.adminId = await this.adminId();
    modifyOrderDto.stockerId = await this.stockerId();
    return await this.orderRepo.createOrder(modifyOrderDto, this.agencyService, this.notificationService, this.productOrderRepo);
  }

  async update(modifyOrderDto: ModifyOrderDto): Promise<UpdateResult | any> {
    modifyOrderDto.adminId = await this.adminId();
    modifyOrderDto.stockerId = await this.stockerId();
    return await this.orderRepo.updateOrder(modifyOrderDto, this.agencyService, this.notificationService, this.productOrderRepo);
  }

  async updateStatus(body: any) {
    body.adminId = await this.adminId();
    body.stockerId = await this.stockerId();
    return await this.orderRepo.updateStatus(body, this.notificationService);
  }

  async updateView(body: any) {
    return await this.orderRepo.updateView(body);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.orderRepo.deleteOrder(id, this.productOrderRepo);
  }

  async search(searchOderDto: SearchOrderDto): Promise<Order[]> {
    const adminId = await this.adminId();
    const stockerId = await this.stockerId();
    return await this.orderRepo.search(searchOderDto, this.productService, adminId, stockerId);
  }

  async adminId() {
    return await this.agencyService.getAgencyIdOfAdmin();
  }

  async stockerId() {
    return await this.agencyService.getAgencyIdOfStocker();
  }

}

