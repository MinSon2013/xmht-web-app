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
import { ADMIN, STOCKER, USER_AREA_MANAGER, USER_SALESMAN } from '../config/constant';

@Injectable()
export class OrdersService {
  private readonly ROLE: number[] = [ADMIN, STOCKER, USER_AREA_MANAGER, USER_SALESMAN];

  constructor(
    public readonly orderRepo: OrderRepository,
    private readonly productService: ProductsService,
    private readonly notificationService: NotificationService,
    private readonly agencyService: AgencyService,
    public readonly productOrderRepo: ProductOrderRepository,
    public readonly userService: UserService,
  ) { }

  async findAll(userId: number): Promise<Order[]> {
    //let agencyId = 0;
    // const user = await this.userService.getOne(userId);
    // if (user && !user.isAdmin && !user.isStocker && !this.ROLE.includes(user.role)) {
    //   const agency = await this.agencyService.findOne(userId);
    //   if (agency) {
    //     agencyId = agency.id;
    //   }
    // }


    const agency = await this.agencyService.findOne(userId);
    const user = await this.userService.getOne(userId);
    let agencyId = 0;
    if (agency) {
      if (this.ROLE.includes(user.role)) {
        agencyId = 0;
      } else {
        agencyId = agency.id;
      }
    }
    return await this.orderRepo.getOrderList(agencyId, this.productService, this.productOrderRepo);
  }

  // async findByMonthYear(body: StatisticsDto) {
  //   const userAgency = await this.agencyService.findOne(body.userId);
  //   if (userAgency) {
  //     if (userAgency.isAdmin || userAgency.isStocker || this.ROLE.includes(userAgency.role)) {
  //       body.agencyId = 0;
  //     } else {
  //       body.agencyId = userAgency.id;
  //     }
  //   }
  //   return await this.orderRepo.findByMonthYear(body);
  // }

  async findOne(id: number, userId: number): Promise<Order> {
    // const adminId = await this.adminId();
    const adminId = await 1;
    // const stockerId = await this.stockerId();
    return await this.orderRepo.getOne(id, userId, this.productService, this.productOrderRepo, adminId);
  }

  async create(modifyOrderDto: ModifyOrderDTO): Promise<ModifyOrderDTO> {
    // modifyOrderDto.adminId = await this.adminId();
    modifyOrderDto.adminId = 1;
    // modifyOrderDto.stockerId = await this.stockerId();
    return await this.orderRepo.createOrder(modifyOrderDto, this.agencyService, this.notificationService, this.productOrderRepo);
  }

  async update(modifyOrderDto: ModifyOrderDTO): Promise<UpdateResult | any> {
    // modifyOrderDto.adminId = await this.adminId();
    modifyOrderDto.adminId = 1;
    // modifyOrderDto.stockerId = await this.stockerId();
    return await this.orderRepo.updateOrder(modifyOrderDto, this.agencyService, this.notificationService, this.productOrderRepo);
  }

  async updateStatus(body: any) {
    // body.adminId = await this.adminId();
    body.adminId = 1;
    // body.stockerId = await this.stockerId();
    return await this.orderRepo.updateStatus(body, this.notificationService);
  }

  async updateView(body: any) {
    return await this.orderRepo.updateView(body);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.orderRepo.deleteOrder(id, this.productOrderRepo);
  }

  async search(searchOderDto: SearchOrderDTO): Promise<Order[]> {
    const agency = await this.agencyService.findOne(searchOderDto.userId);
    const user = await this.userService.getOne(searchOderDto.userId);
    let agencyId = 0;
    if (agency) {
      if (this.ROLE.includes(user.role)) {
        agencyId = 0;
      } else {
        agencyId = agency.id;
      }
    }
    return await this.orderRepo.search(searchOderDto, this.productService, agencyId);
  }

  // async adminId() {
  //   return await this.agencyService.getAgencyIdOfAdmin();
  // }

  // async stockerId() {
  //   return await this.agencyService.getAgencyIdOfStocker();
  // }

}

