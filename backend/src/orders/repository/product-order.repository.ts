import { Order } from '../entities/order.entity';
import { EntityRepository, Repository } from 'typeorm'
import { Product } from '../../products/entities/product.entity';
import { ProductRO } from '../../products/ro/product.ro';
import { ProductOrder } from '../entities/product-order.entity';
import { SearchOrderDTO } from '../dto/search-order.dto';

@EntityRepository(ProductOrder)
export class ProductOrderRepository extends Repository<ProductOrder> {

  // Get product total for order status = 4 (Đã giao hàng)
  // Screen: Statistics
  async sumProduct(body: SearchOrderDTO, agencyIdLogin: number): Promise<ProductRO[]> {
    let res: ProductRO[] = [];
    let sql = this.createQueryBuilder('po')
      .select('SUM(po.quantity)', 'total')
      .addSelect('p.name', 'name')
      .innerJoin(Product, 'p', 'p.id = po.product_id')
      .leftJoin(Order, 'o', 'o.id = po.order_id')
      .where('o.status = 4');

    // if (body.userId && body.userId !== adminId && body.userId !== stockerId) {
    //   // if (body.userId && body.userId !== adminId && body.userId !== stockerId) {
    //   sql = sql.andWhere('o.agencyId = :agencyId', { agencyId: body.agencyId })
    // }
    if (agencyIdLogin > 0) {
      sql = sql.andWhere('o.agencyId = :agencyId', { agencyId: agencyIdLogin })
    } else if (body.agencyId) {
      sql = sql.andWhere('o.agency_id = :agencyId', { agencyId: body.agencyId })
    }
    // if (body.orderId && body.orderId !== 0) {
    //   sql = sql.andWhere('o.id = :orderId', { orderId: body.orderId })
    // }
    if (body.approvedNumber && body.approvedNumber !== 0) {
      sql = sql.andWhere('o.approved_number = :approvedNumber', { approvedNumber: body.approvedNumber })
    }
    if (body.status && body.status !== 0) {
      sql = sql.andWhere('o.status = :status', { status: body.status })
    }
    if (body.productId && body.productId !== 0) {
      sql = sql.andWhere('po.product_id = :productId', { productId: body.productId })
    }
    if (body.startDate && body.startDate.length !== 0
      && body.endDate && body.endDate.length !== 0) {
      sql = sql.andWhere('STR_TO_DATE(po.created_date, \'%d/%m/%Y\') BETWEEN STR_TO_DATE(:start, \'%d/%m/%Y\') AND STR_TO_DATE(:end, \'%d/%m/%Y\') ', { start: body.startDate, end: body.endDate })
    }

    let query = await sql.groupBy('p.name').getRawMany();
    res = query;
    return query;
  }
}