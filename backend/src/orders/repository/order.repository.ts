import { Order } from '../entities/order.entity';
import { DeleteResult, EntityRepository, In, Repository, UpdateResult } from 'typeorm'
import { ModifyOrderDTO } from '../dto/modify-order.dto';
import { ProductOrder } from '../entities/product-order.entity';
import { NotificationService } from '../../notification/notification.service';
import { ProductsService } from '../../products/products.service';
import { ProductOrderRepository } from './product-order.repository';
import { SearchOrderDTO } from '../dto/search-order.dto';
import { NotificationDTO } from '../../notification/dto/notification.dto';
import { Helper } from '../../shared/helper';
import { DetailsOrderDTO } from '../dto/details-order.dto';
import { AgencyService } from '../../agency/agency.service';
import { DeliveryService } from '../../delivery/delivery.service';
import { STOCKER_ROLE } from '../../config/constant';
import { OrderRO } from '../ro/order.ro';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
    private NOTIFY_TYPE_GENERAL = 1;
    private readonly helper = new Helper();
    private readonly statusOrderForAll = [1, 2, 3, 4, 5];
    private readonly statusOrderForStocker = [2, 3, 4]; // Case user is stocker. GET order with status = [2,3]

    constructor() {
        super();
    }

    async getOrderList(role: number, agencyId: number, _take: number, _skip: number,
        productService: ProductsService,
        productOrderRepo: ProductOrderRepository,

    ): Promise<OrderRO> {
        const take = _take;
        const skip = _skip * take;
        let response: OrderRO = new OrderRO;
        let orderResponse: Order[] = [];

        let statusForOrder = this.statusOrderForAll;
        if (role === STOCKER_ROLE) {
            statusForOrder = this.statusOrderForStocker;
        }

        if (agencyId !== 0) {
            let [items, totalCount] = await this.findAndCount(
                {
                    where: {
                        agencyId, status: In(statusForOrder)
                    },
                    order: { id: 'DESC' },
                    take,
                    skip,
                }
            );

            response.totalCount = totalCount;
            orderResponse = items;

        } else {
            let [items, totalCount] = await this.findAndCount(
                {
                    where: {
                        status: In(statusForOrder)
                    },
                    order: { id: 'DESC' },
                    take,
                    skip,
                }
            );

            response.totalCount = totalCount;
            orderResponse = items;
        }

        const productList = await productService.getAllProduct();
        const productOrderList = await productOrderRepo.find();
        orderResponse.forEach(el => {
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
                            category: p.category,
                        };
                        el.products.push(temp);
                    }
                });
            }
        });

        response.orderList = orderResponse;
        return response;
    }

    async getOne(id: number, userId: number, agencyId: number,
        productService: ProductsService,
        productOrderRepo: ProductOrderRepository,
    ): Promise<any> {
        let orderList: any;
        if (agencyId !== 0) {
            orderList = await this.findOne({
                where: {
                    id,
                    agencyId,
                }
            });
        } else {
            orderList = await this.findOne({ id });
        }
        const productList = await productService.getAllProduct();
        const productOrderList = await productOrderRepo.find({ orderId: id });
        let products = [];
        productOrderList.forEach(i => {
            let pName = productList.find(x => x.id === i.productId);
            const temp = {
                id: i.productId,
                name: pName ? pName.name : "",
                quantity: i.quantity,
                category: pName.category,
            };
            products.push(temp);
        });
        return { order: orderList, products: products, productList };
    }

    async createOrder(modifyOrderDto: ModifyOrderDTO,
        notificationService: NotificationService,
        productOrderRepo: ProductOrderRepository
    ): Promise<ModifyOrderDTO> {
        const orderEntity = this.mappingOrder(modifyOrderDto);
        const order = await this.save(orderEntity);
        let entities: ProductOrder[] = [];
        modifyOrderDto.products.forEach(element => {
            const item = new ProductOrder();
            item.orderId = order.id;
            item.productId = element.id;
            item.quantity = element.quantity;
            item.createdDate = this.helper.getUpdateDate(2);
            entities.push(item);
        });
        entities = this.helper.removeDuplicatesFromArrayOfObjects(entities);
        await productOrderRepo.save(entities);

        // tao thong bao
        let contents = `${modifyOrderDto.editer} đã tạo đơn hàng mới`;
        modifyOrderDto.id = order.id;
        await this.createNotify(modifyOrderDto, contents, notificationService, 'CREATE');

        orderEntity.id = order.id;
        return this.mappingResponse(orderEntity, entities);
    }

    async updateOrder(modifyOrderDto: ModifyOrderDTO,
        notificationService: NotificationService,
        productOrderRepo: ProductOrderRepository): Promise<UpdateResult | any> {
        const orderOld = await this.findOne({ id: modifyOrderDto.id });
        if (orderOld.status > 2 && !modifyOrderDto.isAdmin) {
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

        const _maxProductOrder = await productOrderRepo.find({
            order: {
                id: 'DESC',
            },
            take: 1,
        });
        // Get MAX id in ProductOrder
        let maxIdInProductOrderList = _maxProductOrder[0].id;
        maxIdInProductOrderList = maxIdInProductOrderList + 1;

        modifyOrderDto.products.forEach(async element => {
            let newProductOrder = new ProductOrder();
            newProductOrder.id = maxIdInProductOrderList;
            newProductOrder.productId = element.id;
            newProductOrder.orderId = modifyOrderDto.id;
            newProductOrder.quantity = element.quantity;
            newProductOrder.createdDate = this.helper.getUpdateDate(2);
            maxIdInProductOrderList = maxIdInProductOrderList + 1;
            await productOrderRepo.save(newProductOrder);
        });

        // tao thong bao
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
            await this.createNotify(modifyOrderDto, contents, notificationService, 'UPDATE');
        } else {
            if (modifyOrderDto.approvedNumber === 0) {
                contents = `${agencyName} đã cập nhật đơn hàng số [-]`;
            } else {
                contents = `${agencyName} đã cập nhật đơn hàng số [${modifyOrderDto.approvedNumber}]`;
            }
            await this.createNotify(modifyOrderDto, contents, notificationService, 'UPDATE');
        }

        const result = await this.update(modifyOrderDto.id, order);
        // return await this.update(modifyOrderDto.id, order);

        order.id = modifyOrderDto.id;
        return this.mappingResponse(order, modifyOrderDto.products, result);
    }

    async mappingResponse(orderEntity: Order, productOrder: any[], result?: any): Promise<any> {
        let orderList = orderEntity;
        let products = productOrder.map(x => ({
            id: x.productId ?? x.id,
            quantity: x.quantity,
        }));
        return { order: orderList, products: products, result };
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
            .set({
                status: body.status,
                isViewed: body.isViewed,
                approvedNumber: newApprovedNumber,
                shippingDate: body.shippingDate,
                note: body.note
            })
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

        const modifyOrderDto: ModifyOrderDTO = new ModifyOrderDTO();
        modifyOrderDto.sender = body.sender;
        modifyOrderDto.agencyId = body.agencyId;
        modifyOrderDto.notifyReceiver = body.agencyId;
        modifyOrderDto.userUpdated = body.userUpdated;
        modifyOrderDto.id = body.id;
        modifyOrderDto.status = body.status;
        await this.createNotify(modifyOrderDto, contents, notificationService, 'UPDATE');
        let affected = query.affected;
        return { ...body, affected };
    }

    async updateView(body: any) {
        return await this.createQueryBuilder()
            .update(Order)
            .set({ isViewed: body.isViewed })
            .where("id = :orderId", { orderId: body.id })
            .execute();
    }

    async deleteOrder(id: number, productOrderRepo: ProductOrderRepository): Promise<any> {
        await productOrderRepo.createQueryBuilder()
            .delete()
            .where("order_id = :id", { id })
            .execute();
        const result = await this.delete(id);
        return { result, id };
    }

    async search(searchOderDto: SearchOrderDTO, productService: ProductsService, agencyIdLogin: number, role: number): Promise<OrderRO> {
        let response: OrderRO = new OrderRO;
        let statusForOrder = this.statusOrderForAll;

        const productList = await productService.getAllProduct();

        let sql = this.createQueryBuilder('order')
            .select('order')
            .addSelect('productOrder')
            .leftJoin(ProductOrder, 'productOrder', 'productOrder.order_id = order.id')
            .where('1=1');

        if (role === STOCKER_ROLE) {
            statusForOrder = this.statusOrderForStocker;
        }
        sql = sql.andWhere('order.status IN (:statusAll)', { statusAll: statusForOrder })

        if (agencyIdLogin > 0) {
            sql = sql.andWhere('order.agencyId = :agencyId', { agencyId: agencyIdLogin })
        } else if (searchOderDto.agencyId) {
            sql = sql.andWhere('order.agency_id = :agencyId', { agencyId: searchOderDto.agencyId })
        }
        if (searchOderDto.approvedNumber && searchOderDto.approvedNumber !== 0) {
            sql = sql.andWhere('order.approved_number = :approvedNumber', { approvedNumber: searchOderDto.approvedNumber })
        }
        if (searchOderDto.status && searchOderDto.status !== 0) {
            sql = sql.andWhere('order.status = :status', { status: searchOderDto.status })
        }
        if (searchOderDto.productId && searchOderDto.productId !== 0) {
            sql = sql.andWhere('productOrder.product_id = :productId', { productId: searchOderDto.productId })
        }
        if (searchOderDto.startDate && searchOderDto.startDate.length !== 0
            && searchOderDto.endDate && searchOderDto.endDate.length !== 0) {
            sql = sql.andWhere(
                `IF(LENGTH(order.created_date) > 10,
                  STR_TO_DATE(RIGHT(order.created_date, 10), '%d/%m/%Y'),
                  STR_TO_DATE(order.created_date, '%d/%m/%Y')
                )
                BETWEEN STR_TO_DATE(:start, \'%d/%m/%Y\') 
                AND STR_TO_DATE(:end, \'%d/%m/%Y\') `,
                { start: searchOderDto.startDate, end: searchOderDto.endDate }
            );
        }

        let orderList = await sql
            .orderBy('order.id', 'DESC')
            .getRawMany();

        let dataMap = this.mappingSearch(orderList, productList);
        response.totalCount = dataMap.length;

        // If take = 0 then set take = 1000
        const take = searchOderDto.take; // limit
        const skip = searchOderDto.skip; // offset
        if (take > 0) {
            dataMap = dataMap.slice(skip * take, (skip + 1) * take);
        }
        response.orderList = dataMap;
        return response;
    }

    async details(detailsOrderDto: DetailsOrderDTO, productService: ProductsService, agencyIdLogin: number): Promise<any> {
        let _status = [];
        const productList = await productService.getAllProduct();

        let sql = this.createQueryBuilder('order')
            .select('order')
            .addSelect('productOrder')
            .leftJoin(ProductOrder, 'productOrder', 'productOrder.order_id = order.id')
            .where('1=1');

        if (agencyIdLogin > 0) {
            sql = sql.andWhere('order.agencyId = :agencyId', { agencyId: agencyIdLogin })
        } else if (detailsOrderDto.agencyId && detailsOrderDto.agencyId.length > 0) {
            sql = sql.andWhere('order.agency_id = :agencyId', { agencyId: detailsOrderDto.agencyId })
        }
        // Noi nhan
        if (detailsOrderDto.pickupId && detailsOrderDto.pickupId.length > 0) {
            sql = sql.andWhere('order.pickup_id = :pickupId', { pickupId: Number(detailsOrderDto.pickupId) })
        }
        // Noi giao
        if (detailsOrderDto.deliveryId && detailsOrderDto.deliveryId.length > 0) {
            sql = sql.andWhere('order.delivery_id = :deliveryId', { deliveryId: Number(detailsOrderDto.deliveryId) })
        }
        // So phuong tien
        if (detailsOrderDto.licensePlate && detailsOrderDto.licensePlate.length > 0) {
            sql = sql.andWhere("order.license_plates LIKE :licensePlate", { licensePlate: `%${detailsOrderDto.licensePlate}%` })
        }
        // Tai xe
        if (detailsOrderDto.driver && detailsOrderDto.driver.length > 0) {
            sql = sql.andWhere("order.driver LIKE :driver", { driver: `${detailsOrderDto.driver}` })
        }
        // Phuong thuc nhan
        if (detailsOrderDto.receipt && detailsOrderDto.receipt.length > 0) {
            sql = sql.andWhere('order.receipt = :receipt', { receipt: Number(detailsOrderDto.receipt) })
        }
        // San pham
        if (detailsOrderDto.productId && detailsOrderDto.productId.length > 0) {
            sql = sql.andWhere('productOrder.product_id = :productId', { productId: detailsOrderDto.productId })
        }
        if (detailsOrderDto.status && detailsOrderDto.status.length > 0) {
            _status = detailsOrderDto.status.split(",");
            if (detailsOrderDto.startDate && detailsOrderDto.startDate.length !== 0
                && detailsOrderDto.endDate && detailsOrderDto.endDate.length !== 0) {
                if (Number(_status[0]) === 2) { // Order confirmed
                    sql = sql.andWhere('((order.status = :status1', { status1: Number(_status[0]) });
                    sql = sql.andWhere(
                        `IF(LENGTH(order.confirmed_date) > 10,
                          STR_TO_DATE(RIGHT(order.confirmed_date, 16), '%H:%i %d/%m/%Y'),
                          STR_TO_DATE(order.confirmed_date, '%d/%m/%Y')
                        )
                        BETWEEN STR_TO_DATE(:start, \'%H:%i %d/%m/%Y\') 
                        AND STR_TO_DATE(:end, \'%H:%i %d/%m/%Y\')
                    )`,
                        { start: detailsOrderDto.startDate, end: detailsOrderDto.endDate }
                    );
                }
                if (Number(_status[1]) === 4) { // Order Shipped
                    sql = sql.orWhere('(order.status = :status2', { status2: Number(_status[1]) });
                    sql = sql.andWhere(
                        `IF(LENGTH(order.shipping_date) > 10,
                          STR_TO_DATE(RIGHT(order.shipping_date, 16), '%H:%i %d/%m/%Y'),
                          STR_TO_DATE(order.shipping_date, '%d/%m/%Y')
                        )
                        BETWEEN STR_TO_DATE(:start, \'%H:%i %d/%m/%Y\') 
                        AND STR_TO_DATE(:end, \'%H:%i %d/%m/%Y\')
                        )) `,
                        { start: detailsOrderDto.startDate, end: detailsOrderDto.endDate }
                    );
                }
            }
        } else if (detailsOrderDto.startDate && detailsOrderDto.startDate.length !== 0
            && detailsOrderDto.endDate && detailsOrderDto.endDate.length !== 0) {
            sql = sql.andWhere(
                `IF(LENGTH(order.received_date) > 10,
                  STR_TO_DATE(RIGHT(order.received_date, 10), '%d/%m/%Y'),
                  STR_TO_DATE(order.received_date, '%d/%m/%Y')
                )
                BETWEEN STR_TO_DATE(:start, \'%d/%m/%Y\') 
                AND STR_TO_DATE(:end, \'%d/%m/%Y\') `,
                { start: detailsOrderDto.startDate, end: detailsOrderDto.endDate }
            );
        }

        let orderList: any[] = [];
        if (detailsOrderDto.status && detailsOrderDto.status.length > 0) {
            // Request from SlideShow screen
            orderList = await sql.orderBy('order.approved_number', 'DESC').getRawMany();
        } else {
            // Request from Details Statistic screen
            orderList = await sql.orderBy('order.id', 'DESC').getRawMany();
        }

        let dataMap = this.mappingSearch(orderList, productList);
        let totalCount = dataMap.length;

        // If take = 0 then get all orders
        const take = detailsOrderDto.take; // limit
        const skip = detailsOrderDto.skip; // offset
        if (take > 0) {
            dataMap = dataMap.slice(skip * take, (skip + 1) * take);
        }

        return { orders: dataMap, productList, totalCount };
    }

    async getfilterList(
        userId: number,
        agencyId: number,
        productService: ProductsService,
        agencyService: AgencyService,
        deliveryService: DeliveryService,
    ): Promise<any> {
        let driverList = [];
        let licensePlateList = [];
        let agencyList = [];
        let deliveryList = [];
        let productList = [];
        let pickupList = [];

        const query = await this.createQueryBuilder()
            .select('agency_id as agencyId')
            .addSelect('driver as driver')
            .addSelect('license_plates as licensePlates')
            .addSelect('pickup_id as pickupId')
            .getRawMany();

        driverList = query.map(x => ({ agencyId: x.agencyId, driver: x.driver }));
        driverList = driverList.filter((elem, index, self) => {
            return index === self.indexOf(elem);
        })

        licensePlateList = query.map(x => ({ agencyId: x.agencyId, licensePlates: x.licensePlates }));
        licensePlateList = licensePlateList.filter((elem, index, self) => {
            return index === self.indexOf(elem);
        })

        pickupList = query.map(x => ({ agencyId: x.agencyId, pickupId: x.pickupId }));
        pickupList = pickupList.filter((elem, index, self) => {
            return index === self.indexOf(elem);
        })

        productList = await productService.getAllProduct();

        if (agencyId === 0) {
            agencyList = await agencyService.findAll(0);
        } else {
            let agency = await agencyService.findOne(userId);
            agencyList = [agency];
        }

        deliveryList = await deliveryService.findAll();

        return { productList, agencyList, driverList, licensePlateList, deliveryList, pickupList };
    }

    private mappingOrder(modifyOrderDto: ModifyOrderDTO): Order {
        const order = new Order();
        order.createdDate = modifyOrderDto.createdDate;
        order.deliveryId = modifyOrderDto.deliveryId;
        order.pickupId = modifyOrderDto.pickupId;
        order.productTotal = modifyOrderDto.productTotal;
        order.driver = modifyOrderDto.driver.trim();
        order.transport = modifyOrderDto.transport;
        order.licensePlates = modifyOrderDto.licensePlates.trim();
        order.receivedDate = modifyOrderDto.receivedDate;
        order.status = modifyOrderDto.status;
        order.note = modifyOrderDto.note.trim();
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
            item.receipt = el.order_receipt;
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
                    const prod = productList.find(x => x.id === i.productOrder_product_id);
                    const item2 = {
                        id: i.productOrder_product_id,
                        quantity: i.productOrder_quantity,
                        name: prod ? prod.name : '',
                        category: prod ? prod.category : 0,
                    }
                    el.products.push(item2);
                });
            }
        });

        return list1;
    }

    async createNotify(modifyOrderDto, contents: string, notificationService: NotificationService, k: string) {
        const notifyDto = new NotificationDTO();
        notifyDto.contents = contents;
        notifyDto.isPublished = true;
        notifyDto.agencyList = [];
        notifyDto.note = '';
        notifyDto.fileName = '';
        notifyDto.filePath = '';
        notifyDto.mimeType = '';
        notifyDto.agencyList.push(modifyOrderDto.agencyId);
        notifyDto.agencyList.push(modifyOrderDto.notifyReceiver);
        notifyDto.sender = modifyOrderDto.userUpdated || modifyOrderDto.sender;
        notifyDto.notificationType = this.NOTIFY_TYPE_GENERAL;
        notifyDto.updatedDate = this.helper.getUpdateDate(2);
        notifyDto.orderId = modifyOrderDto.id;
        notifyDto.statusOrder = this.getStatusOrder(modifyOrderDto.status);
        if (k === 'UPDATE') {
            await notificationService.updateNotifyOrder(notifyDto);
        } else if (k === 'CREATE') {
            notifyDto.createdDate = this.helper.getUpdateDate(2);
            await notificationService.create(notifyDto);
        }
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

    private getStatusOrder(k: number): string {
        const STATUS = {
            label1: 'Chờ giải quyết',
            label2: 'Đồng ý đơn hàng',
            label3: 'Đang giao hàng',
            label4: 'Đã giao hàng',
            label5: 'Hủy đơn hàng'
        };

        let str = '';
        switch (k) {
            case 1:
                str = STATUS.label1;
                break;
            case 2:
                str = STATUS.label2;
                break;
            case 3:
                str = STATUS.label3;
                break;
            case 4:
                str = STATUS.label4;
                break;
            case 5:
                str = STATUS.label5;
                break;
        }

        return str;
    }
}