import { Order } from "../entities/order.entity";

export class OrderRO {
    orderList: Order[];
    totalCount: number;
}