import { Order } from '../entities/order.entity';
import { DeleteResult, EntityRepository, Repository, UpdateResult } from 'typeorm'
import { StatisticsDto } from '../dto/statistics.dto';
import { ModifyOrderDto } from '../dto/modify-order.dto';
import { ProductOrder } from '../entities/product-order.entity';
import { NotificationService } from '../../notification/notification.service';
import { AgencyService } from '../../agency/agency.service';
import { ProductsService } from '../../products/products.service';
import { ProductOrderRepository } from './product-order.repository';
import { SearchOrderDto } from '../dto/search-order.dto';
import { NotificationDto } from '../../notification/dto/notification.dto';
import moment from 'moment';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {

    constructor() {
        super();
    }

    async getOrderList(userId: number,
        productService: ProductsService,
        productOrderRepo: ProductOrderRepository,
        adminId: number,
        stockerId: number,
    ): Promise<Order[]> {
        let response: Order[] = [];
        let orderList: any;
        if (userId !== adminId && userId !== stockerId) {
            orderList = await this.find({
                where: {
                    agencyId: userId
                }
            });
        } else {
            orderList = await this.find();
        }
        response = orderList;
        const productList = await productService.getAllProduct();
        const productOrderList = await productOrderRepo.find();
        orderList.forEach(el => {
            el.products = [];
            const items = productOrderList.filter(x => x.orderId === el.id);
            if (items.length > 0) {
                items.forEach(i => {
                    const p = productList.find(x => x.id === i.productId);
                    if (p) {
                        const temp = {
                            id: i.productId,
                            name: p.name ? p.name : '',
                            quantity: i.quantity,
                        };
                        el.products.push(temp);
                    }
                });
            }
        });
        return response;
    }

    async findByMonthYear(body: StatisticsDto) {
        let response: Order[] = [];
        let orderList: any;
        let length = body.dateTime.length;
        let query = this.createQueryBuilder('order')
            .select('order.created_date as createdDate')
            .where('RIGHT(order.created_date, :length) = :dateTime', { length, dateTime: body.dateTime });

        if (body.userId !== body.adminId && body.userId !== body.stockerId) {
            query = query.andWhere('order.agency_id = :agencyId', { agencyId: body.userId })

        }
        response = await query.getRawMany();
        return response;
    }

    async getOne(id: number, userId: number,
        productService: ProductsService,
        productOrderRepo: ProductOrderRepository,
        adminId: number,
        stockerId: number,
    ): Promise<Order> {
        let response = new Order();
        let orderList: any;
        if (userId !== adminId && userId !== stockerId) {
            orderList = await this.find({
                where: {
                    id,
                    agencyId: userId
                }
            });
        } else {
            orderList = await this.findOne({ id });
        }
        response = orderList;
        const productList = await productService.getAllProduct();
        const productOrderList = await productOrderRepo.find();
        const items = productOrderList.filter(x => x.orderId === response.id);
        if (items.length > 0) {
            items.forEach(i => {
                const temp = {
                    id: i.productId,
                    name: productList.find(x => x.id === i.productId).name,
                    quantity: i.quantity,
                };
                response.products.push(temp);
            });
        }
        return response;
    }

    async createOrder(modifyOrderDto: ModifyOrderDto,
        agencyService: AgencyService,
        notificationService: NotificationService,
        productOrderRepo: ProductOrderRepository
    ): Promise<ModifyOrderDto> {
        const orderEntity = this.mappingOrder(modifyOrderDto);
        const order = await this.save(orderEntity);
        const entities: ProductOrder[] = [];
        modifyOrderDto.products.forEach(element => {
            const item = new ProductOrder();
            item.orderId = order.id;
            item.productId = element.id;
            item.quantity = element.quantity;
            item.createdDate = modifyOrderDto.createdDate;
            entities.push(item);
        });
        await productOrderRepo.save(entities);

        // tao thong bao
        const agencyName = await agencyService.getName(modifyOrderDto.sender);
        let contents = `${agencyName} đã tạo đơn hàng mới`;
        await this.createNotify(modifyOrderDto, contents, notificationService);

        modifyOrderDto.id = order.id;
        return modifyOrderDto;
    }

    async updateOrder(modifyOrderDto: ModifyOrderDto,
        agencyService: AgencyService,
        notificationService: NotificationService,
        productOrderRepo: ProductOrderRepository): Promise<UpdateResult | any> {
        const orderOld = await this.findOne({ id: modifyOrderDto.id });
        if (orderOld.status > 1 && !modifyOrderDto.isAdmin) {
            return { code: 404, error: 'Not allow update' };
        }
        const order = this.mappingOrder(modifyOrderDto);

        if (modifyOrderDto.status > 1) {
            let newApprovedNumber: number = 0;
            const approvedNumber = await this.getApprovdeNumberByOrderId(modifyOrderDto.id);
            if (approvedNumber === 0) {
                const max = await this.getMaxApprovedNumber();
                newApprovedNumber = max + 1;
            } else {
                newApprovedNumber = approvedNumber;
            }
            order.approvedNumber = newApprovedNumber;
        }

        // Cập nhật bảng product-order
        await productOrderRepo.createQueryBuilder()
            .delete()
            .where("order_id = :orderId", { orderId: modifyOrderDto.id })
            .execute();

        modifyOrderDto.products.forEach(async element => {
            const newProductOrder = new ProductOrder();
            newProductOrder.productId = element.id;
            newProductOrder.orderId = modifyOrderDto.id;
            newProductOrder.quantity = element.quantity;
            newProductOrder.createdDate = moment().format('DD/MM/YYYY');
            await productOrderRepo.save(newProductOrder);
        });

        // tao thong bao
        //const agencyName = await agencyService.getName(modifyOrderDto.sender);
        const agencyName = modifyOrderDto.editer;
        let contents = '';
        if (orderOld.status !== modifyOrderDto.status) {
            switch (modifyOrderDto.status) {
                case 2:
                    contents = `Đơn hàng số [${order.approvedNumber}] đang nhận đơn hàng `;
                    break;
                case 3:
                    contents = `Đơn hàng số [${order.approvedNumber}] đang giao hàng `;
                    break;
                case 4:
                    contents = `Đơn hàng số [${order.approvedNumber}] đã giao hàng `;
                    break;
                case 5:
                    contents = `Đơn hàng số [${order.approvedNumber}] đã bị hủy `;
                    break;
            }
            await this.createNotify(modifyOrderDto, contents, notificationService);
        } else {
            if (modifyOrderDto.approvedNumber === 0) {
                contents = `${agencyName} đã cập nhật đơn hàng số [-]`;
            } else {
                contents = `${agencyName} đã cập nhật đơn hàng số [${modifyOrderDto.approvedNumber}]`;
            }
            await this.createNotify(modifyOrderDto, contents, notificationService);
        }
        return await this.update(modifyOrderDto.id, order);
    }

    async updateStatus(body: any, notificationService: NotificationService) {
        let newApprovedNumber: number = 0;
        const approvedNumber = await this.getApprovdeNumberByOrderId(body.id);
        if (approvedNumber === 0) {
            const max = await this.getMaxApprovedNumber();
            newApprovedNumber = max + 1;
        } else {
            newApprovedNumber = approvedNumber;
        }
        const query = await this.createQueryBuilder()
            .update(Order)
            .set({ status: body.status, 
                isViewed: body.isViewed, 
                approvedNumber: newApprovedNumber, 
                shippingDate: body.shippingDate,
                note: body.note })
            .where("id = :orderId", { orderId: body.id })
            .execute();

        let contents = '';
        switch (body.status) {
            case 2:
                contents = `Đơn hàng số [${newApprovedNumber}] đang nhận đơn hàng `;
                break;
            case 3:
                contents = `Đơn hàng số [${newApprovedNumber}] đang giao hàng`;
                break;
            case 4:
                contents = `Đơn hàng số [${newApprovedNumber}] đã giao hàng `;
                break;
            case 5:
                contents = `Đơn hàng số [${newApprovedNumber}] đã bị hủy `;
                break;
        }

        const modifyOrderDto: ModifyOrderDto = new ModifyOrderDto();
        modifyOrderDto.sender = body.sender;
        modifyOrderDto.agencyId = body.agencyId;
        modifyOrderDto.notifyReceiver = body.agencyId;
        modifyOrderDto.agencyUpdated = body.agencyUpdated;
        await this.createNotify(modifyOrderDto, contents, notificationService);
        return query;
    }

    async updateView(body: any) {
        return await this.createQueryBuilder()
            .update(Order)
            .set({ isViewed: body.isViewed })
            .where("id = :orderId", { orderId: body.id })
            .execute();
    }

    async deleteOrder(id: number, productOrderRepo: ProductOrderRepository): Promise<DeleteResult> {
        await productOrderRepo.createQueryBuilder()
            .delete()
            .where("order_id = :id", { id })
            .execute();
        return await this.delete(id);
    }

    async search(searchOderDto: SearchOrderDto, productService: ProductsService, adminId: number, stockerId: number): Promise<Order[]> {
        let response: Order[] = [];
        const productList = await productService.getAllProduct();

        let sql = this.createQueryBuilder('order')
            .select('order')
            .addSelect('productOrder')
            .leftJoin(ProductOrder, 'productOrder', 'productOrder.order_id = order.id')
            .where('1=1');

        if (searchOderDto.userId && searchOderDto.userId !== adminId && searchOderDto.userId !== stockerId) {
            sql = sql.andWhere('order.agencyId = :agencyId', { agencyId: searchOderDto.userId })
        }
        if (searchOderDto.orderId && searchOderDto.orderId !== 0) {
            sql = sql.andWhere('order.approved_number = :orderId', { orderId: searchOderDto.orderId })
        }
        /* if (searchOderDto.agencyId && searchOderDto.agencyId !== adminId && searchOderDto.userId !== stockerId) { */
        if (searchOderDto.agencyId && searchOderDto.agencyId !== adminId && searchOderDto.agencyId !== stockerId) {
            sql = sql.andWhere('order.agency_id = :agencyId', { agencyId: searchOderDto.agencyId })
        }
        if (searchOderDto.status && searchOderDto.status !== 0) {
            sql = sql.andWhere('order.status = :status', { status: searchOderDto.status })
        }
        if (searchOderDto.productId && searchOderDto.productId !== 0) {
            sql = sql.andWhere('productOrder.product_id = :productId', { productId: searchOderDto.productId })
        }
        if (searchOderDto.startDate && searchOderDto.startDate.length !== 0
            && searchOderDto.endDate && searchOderDto.endDate.length !== 0) {
            sql = sql.andWhere('STR_TO_DATE(order.created_date, \'%d/%m/%Y\') BETWEEN STR_TO_DATE(:start, \'%d/%m/%Y\') AND STR_TO_DATE(:end, \'%d/%m/%Y\') ', { start: searchOderDto.startDate, end: searchOderDto.endDate })
        }
        const orderList = await sql.orderBy('order.id').getRawMany();
        const dataMap = this.mappingSearch(orderList, productList);
        response = dataMap;
        return response;
    }

    private mappingOrder(modifyOrderDto: ModifyOrderDto): Order {
        const order = new Order();
        order.createdDate = modifyOrderDto.createdDate;
        order.deliveryId = modifyOrderDto.deliveryId;
        order.pickupId = modifyOrderDto.pickupId;
        order.productTotal = modifyOrderDto.productTotal;
        order.driver = modifyOrderDto.driver;
        order.transport = modifyOrderDto.transport;
        order.licensePlates = modifyOrderDto.licensePlates;
        order.receivedDate = modifyOrderDto.receivedDate;
        order.status = modifyOrderDto.status;
        order.note = modifyOrderDto.note;
        order.contract = modifyOrderDto.contract;
        order.agencyId = modifyOrderDto.agencyId;
        order.isViewed = modifyOrderDto.isViewed;
        order.sender = modifyOrderDto.sender;
        order.approvedNumber = modifyOrderDto.approvedNumber;
        order.receipt = modifyOrderDto.receipt;
        order.confirmedDate = modifyOrderDto.confirmedDate;
        order.shippingDate = modifyOrderDto.shippingDate;
        return order;
    }

    private mappingSearch(data: any[], productList: any[]) {
        let list1: Order[] = [];
        data.forEach(el => {
            const item = new Order();
            item.id = el.order_id;
            item.agencyId = el.order_agency_id;
            item.createdDate = el.order_created_date;
            item.deliveryId = el.order_delivery_id;
            item.pickupId = el.order_pickup_id;
            item.productTotal = el.order_product_total;
            item.transport = el.order_transport;
            item.licensePlates = el.order_license_plates;
            item.driver = el.order_driver;
            item.receivedDate = el.order_received_date;
            item.status = el.order_status;
            item.note = el.order_note;
            item.contract = el.order_contract;
            item.products = [];
            item.isViewed = el.order_is_viewed;
            item.sender = el.order_sender;
            item.approvedNumber = el.order_approved_number;
            item.receipt = el.receipt;
            item.confirmedDate = el.order_confirmed_date;
            item.shippingDate = el.order_shipping_date;
            list1.push(item);
        });

        // Bo phan tu trung nhau
        const ids = list1.map(o => o.id);
        list1 = list1.filter(({ id }, index) => !ids.includes(id, index + 1));

        list1.forEach(el => {
            const proList = data.filter(x => x.order_id === el.id);
            if (proList.length > 0) {
                proList.forEach(i => {
                    const item2 = {
                        id: i.productOrder_product_id,
                        quantity: i.productOrder_quantity,
                       // name: productList.find(x => x.id === i.productOrder_product_id),
                        name: productList.find(x => x.id === i.productOrder_product_id).name,
                    }
                    el.products.push(item2);
                });
            }
        });

        return list1;
    }

    async createNotify(modifyOrderDto, contents: string, notificationService: NotificationService) {
        const adminId = modifyOrderDto.adminId || modifyOrderDto.stockerId;
        const notifyDto = new NotificationDto();
        notifyDto.contents = contents;
        notifyDto.shortContents = contents;
        notifyDto.isPublished = true;
        notifyDto.agencyList = [];
        notifyDto.note = '';
        notifyDto.fileName = '';
        notifyDto.filePath = '';
        notifyDto.mimeType = '';
        notifyDto.agencyList.push(modifyOrderDto.notifyReceiver === 0 ? adminId : modifyOrderDto.notifyReceiver);
        notifyDto.createdDate = modifyOrderDto.createdDate ? modifyOrderDto.createdDate : moment(new Date).format('HH:mm DD/MM/YYYY');
        notifyDto.sender = modifyOrderDto.id !== 0 ? modifyOrderDto.agencyUpdated : modifyOrderDto.sender;
        await notificationService.create(notifyDto);
    }

    private async getApprovdeNumberByOrderId(orderId: number) {
        const order = await this.findOne(orderId);
        return order.approvedNumber;
    }

    private async getMaxApprovedNumber() {
        let max: number = 0;
        const order = await this.createQueryBuilder()
            .select('MAX(o.approved_number) as max')
            .from(Order, 'o')
            .getRawOne();
        return max = order.max;
    }
}