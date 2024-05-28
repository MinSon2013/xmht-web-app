import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ModifyOrderDTO } from '../orders/dto/modify-order.dto';
import { NotificationService } from '../notification/notification.service';
import { OrdersService } from '../orders/orders.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationDTO } from '../notification/dto/notification.dto';
import { Notification } from '../notification/entities/notification.entity';
import { ModifyReportDTO } from '../report/dto/modify-report.dto';
import { ReportService } from '../report/report.service';
import { ProductsService } from '../products/products.service';
import { ProductDTO } from '../products/dto/modify-product.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private userService: UserService,
    private orderService: OrdersService,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private productService: ProductsService,
    private configService: ConfigService,
  ) { }

  afterInit(): void {
    console.log(`Websocket Gateway initialized.`);
  }

  async onModuleInit() {
    console.log(`onModuleInit`);
  }

  handleDisconnect(socket: Socket) {
    console.log('handleDisconnect')
    this.disconnect(socket);
  }

  async handleConnection(client: Socket) {
    console.log('handleConnection')
    try {
      if (!client.handshake.headers.authorization
        || client.handshake.headers.authorization === 'null') {
        return this.disconnect(client);
      }
      const decodedToken = await this.verifyJwt(client.handshake.headers.authorization);
      const user = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(client);
      } else {
        console.log(`Client connected: ${client.id}`);
        client.data = { ...user, agencyId: decodedToken.user.agencyId };
        return this.server.to(client.id).emit('connected', true);
      }
    } catch (err) {
      return this.disconnect(client);
    }
  }

  private disconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.server.to(socket.id).emit('disconnected', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('reconnect')
  async reconnect(client: Socket) {
    console.log(`Client reconnect: ${client.id}`);
    this.handleConnection(client);
  }

  verifyJwt(jwt: string): Promise<any> {
    return this.jwtService.verifyAsync(jwt, { secret: this.configService.get('JWT_SECRET_KEY') });
  }

  /** Listening client logout */
  @SubscribeMessage('logOut')
  async emitLogOut(socket: Socket) {
    console.log(`Client logOut: ${socket.id}`);
    socket.disconnect();
  }

  /** Listening client added order */
  @SubscribeMessage('addOrder')
  async onAddOrder(client: Socket, payload: ModifyOrderDTO) {
    console.log('socket-server: onAddOrder ... ' + JSON.stringify(client.data))
    const createdOrder = await this.orderService.create(payload);
    await this.server.emit('emitOrderAdded', createdOrder);
    await this.emitNotifyCRUD(client);
  }

  /** Listening client updated order */
  @SubscribeMessage('updateOrder')
  async onUpdateOrder(client: Socket, payload: ModifyOrderDTO) {
    console.log('socket-server: onUpdateOrder ... ' + JSON.stringify(client.data))
    const updatedOrder = await this.orderService.update(payload);
    await this.server.emit('emitOrderUpdated', updatedOrder);
    await this.emitNotifyCRUD(client);
  }

  /** Listening client deleted order */
  @SubscribeMessage('deleteOrder')
  async deleteOrder(client: Socket, payload: any) {
    console.log('socket-server: deleteOrder ... ' + JSON.stringify(client.data))
    const deletedOrder = await this.orderService.delete(payload);
    await this.server.emit('emitOrderDeleted', deletedOrder);
  }

  /** Listening client changed status order */
  @SubscribeMessage('changeStatusOrder')
  async changeStatusOrder(client: Socket, payload: any) {
    console.log('socket-server: changeStatusOrder ... ' + JSON.stringify(client.data))
    const res = await this.orderService.updateStatus(payload);
    await this.server.emit('emitStatusOrderChanged', res);
    await this.emitNotifyCRUD(client);
  }

  /** Listening client viewed order */
  @SubscribeMessage('changeIsViewedOrder')
  async changeIsViewedOrder(client: Socket, payload: any) {
    console.log('socket-server: changeIsViewedOrder ... ' + JSON.stringify(client.data))
    await this.orderService.updateView(payload);
    await this.server.emit('emitIsViewOrderChanged', true);
  }

  /** Listening client added notify */
  @SubscribeMessage('addNotify')
  async onAddNotify(client: Socket, payload: NotificationDTO) {
    console.log('socket-server: onAddNotify ... ' + JSON.stringify(client.data))
    const createdNotify: Notification = await this.notificationService.create(payload);
    await this.server.to(client.id).emit('emitNotifyAdded', createdNotify);
    if (payload.isPublished) {
      await this.emitNotifyCRUD(client);
    }
  }

  /** Listening client updated notify */
  @SubscribeMessage('updateNotify')
  async onUpdateNotify(client: Socket, payload: NotificationDTO) {
    console.log('socket-server: onUpdateNotify ... ' + JSON.stringify(client.data))
    const updatedNotify = await this.notificationService.update(payload);
    const notifyUpdated = await this.notificationService.getOne(payload.id);
    await this.server.to(client.id).emit('emitNotifyUpdatedToClient', updatedNotify);
    await this.server.emit('emitNotifyUpdated', notifyUpdated);
    if (payload.isPublished) {
      await this.emitNotifyCRUD(client);
    }
  }

  /** Listening client changed viewed notify */
  @SubscribeMessage('changeStatusNotify')
  async changeStatusNotify(client: Socket, payload: any) {
    console.log('socket-server: changeStatusNotify ... ' + JSON.stringify(client.data))
    await this.notificationService.updateIsView(payload);
  }

  /** Emit notify modified to clients */
  async emitNotifyCRUD(client: Socket) {
    console.log('socket-server: emitNotifyCRUD .... ' + client.data)
    return this.server.emit('emitNotifyCRUD', 'emitNotifyCRUD');
  }

  /** Listening client added report */
  @SubscribeMessage('addReport')
  async onAddReport(client: Socket, payload: ModifyReportDTO) {
    console.log('socket-server: onAddReport ... ' + JSON.stringify(client.data))
    const addReport = await this.reportService.create(payload);
    await this.server.emit('emitReportAdded', addReport);
    await this.emitGetReportList(client);
  }

  /** Listening client updated report */
  @SubscribeMessage('updateReport')
  async onUpdateReport(client: Socket, payload: ModifyReportDTO) {
    console.log('socket-server: onUpdateReport ... ' + JSON.stringify(client.data))
    const updateReport = await this.reportService.update(payload);
    const reportUpdated = await this.reportService.findOne(payload.id);
    await this.server.to(client.id).emit('emitReportUpdatedToClient', updateReport);
    await this.server.emit('emitReportUpdated', reportUpdated);
    await this.emitGetReportList(client);
  }

  /** Listening client deleted report */
  @SubscribeMessage('deleteReport')
  async deleteReport(client: Socket, payload: any) {
    console.log('socket-server: deleteReport ... ' + JSON.stringify(client.data))
    const deleteReport = await this.reportService.delete(payload);
    await this.server.to(client.id).emit('emitReportDeleted', deleteReport);
    await this.emitGetReportList(client);
  }

  /** emit to client modified report */
  async emitGetReportList(client: Socket) {
    console.log('socket-server: emitGetReportList ... ' + client.data)
    return this.server.emit('emitGetReportList', 'emitGetReportList');
  }

  /** Listening client added product */
  @SubscribeMessage('addProduct')
  async onAddProduct(client: Socket, payload: ProductDTO) {
    console.log('socket-server: onAddProduct ... ' + JSON.stringify(client.data))
    const addProduct = await this.productService.create(payload);
    await this.server.to(client.id).emit('emitProductAdded', addProduct);
    await this.emitGetProductList(client);
  }

  /** Listening client updated product */
  @SubscribeMessage('updateProduct')
  async onUpdateProduct(client: Socket, payload: ProductDTO) {
    console.log('socket-server: onUpdateProduct....' + JSON.stringify(client.data))
    const updateProduct = await this.productService.update(payload);
    const productUpdated = await this.productService.findOne(payload.id);
    await this.server.to(client.id).emit('emitProductUpdatedToClient', updateProduct);
    await this.server.emit('emitProductUpdated', productUpdated);
    await this.emitGetProductList(client);
  }

  /** Listening client deleted product */
  @SubscribeMessage('deleteProduct')
  async deleteProduct(client: Socket, payload: any) {
    console.log('socket-server: deleteProduct....' + JSON.stringify(client.data))
    const deleteProduct = await this.productService.delete(payload);
    await this.server.to(client.id).emit('emitProductDeleted', deleteProduct);
    await this.emitGetProductList(client);
  }

  /** Emit to client modified product */
  async emitGetProductList(client: Socket) {
    console.log('socket-server: emitGetProductList ... ' + client.data)
    return this.server.emit('emitGetProductList', 'emitGetProductList');
  }
}