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
import { Order } from '../orders/entities/order.entity';
import { NotificationDTO } from '../notification/dto/notification.dto';
import { Notification } from '../notification/entities/notification.entity';
import { ModifyReportDTO } from '../report/dto/modify-report.dto';
import { ReportService } from '../report/report.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private orderService: OrdersService,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    console.log(`onModuleInit`);
  }

  afterInit(): void {
    console.log(`Websocket Gateway initialized.`);
  }

  handleDisconnect(socket: Socket) {
    this.disconnect(socket);
  }

  async handleConnection(client: Socket) {
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
        return this.server.to(client.id).emit('connected');
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

  @SubscribeMessage('logOut')
  async emitLogOut(socket: Socket) {
    console.log(`Client logOut: ${socket.id}`);
    socket.disconnect();
  }

  @SubscribeMessage('addOrder')
  async onAddOrder(client: Socket, payload: ModifyOrderDTO) {
    console.log('api-gateway: onAddOrder....' + JSON.stringify(client.data))
    const createdOrder = await this.orderService.create(payload);
    await this.server.to(client.id).emit('orderAdded', createdOrder);
    await this.emitGetOrderList(client);
    await this.emitNotifyList(client);
    await this.emitBadgeNumber(client);
  }

  @SubscribeMessage('updateOrder')
  async onUpdateOrder(client: Socket, payload: ModifyOrderDTO) {
    console.log('api-gateway: onUpdateOrder....' + JSON.stringify(client.data))
    const updatedOrder = await this.orderService.update(payload);
    await this.server.to(client.id).emit('orderUpdated', updatedOrder);
    await this.emitGetOrderList(client);
    await this.emitNotifyList(client);
    await this.emitBadgeNumber(client);
  }

  @SubscribeMessage('addNotify')
  async onAddNotify(client: Socket, payload: NotificationDTO) {
    console.log('api-gateway: onAddNotify....' + JSON.stringify(client.data))
    const createdNotify: Notification = await this.notificationService.create(payload);
    await this.server.to(client.id).emit('notifyAdded', createdNotify);
    if (payload.isPublished) {
      await this.emitNotifyList(client);
      await this.emitBadgeNumber(client);
    }
  }

  @SubscribeMessage('updateNotify')
  async onUpdateNotify(client: Socket, payload: NotificationDTO) {
    console.log('api-gateway: onUpdateNotify....' + JSON.stringify(client.data))
    const updatedNotify = await this.notificationService.update(payload);
    await this.server.to(client.id).emit('notifyUpdated', updatedNotify);
    if (payload.isPublished) {
      await this.emitNotifyList(client);
      await this.emitBadgeNumber(client);
    }
  }

  @SubscribeMessage('changeStatusNotify')
  async changeStatusNotify(client: Socket, payload: any) {
    console.log('api-gateway: changeStatusNotify....' + JSON.stringify(client.data))
    await this.notificationService.updateIsView(payload);
    await this.emitBadgeNumber(client);
  }

  @SubscribeMessage('changeStatusOrder')
  async changeStatusOrder(client: Socket, payload: any) {
    console.log('api-gateway: changeStatusOrder....' + JSON.stringify(client.data))
    const res = await this.orderService.updateStatus(payload);
    await this.server.to(client.id).emit('statusOrderChanged', res);
    await this.emitGetOrderList(client);
    await this.emitNotifyList(client);
    await this.emitBadgeNumber(client);
  }

  @SubscribeMessage('changeIsViewedOrder')
  async changeIsViewedOrder(client: Socket, payload: any) {
    console.log('api-gateway: changeIsViewedOrder....' + JSON.stringify(client.data))
    await this.orderService.updateView(payload);
    await this.emitGetOrderList(client);
  }

  @SubscribeMessage('getOrderList')
  async getOrderList(client: Socket, req?: any) {
    console.log('api-gateway: getOrderList....' + JSON.stringify(client.data))
    if (client.data.isAdmin) {
      client.data.agencyId = 0;
    }
    const orderList: Order[] = await this.orderService.findAll(client.data.agencyId);
    await this.server.to(client.id).emit('getOrderList', orderList);
  }

  @SubscribeMessage('getBadge')
  async getBadgeNumber(client: Socket, req?: any) {
    console.log('getBadge..... + ' + client.data.agencyId)
    if (req && req.agencyId) {
      const notification = await this.notificationService.getBadgeNumber(req.agencyId);
      console.log('notification = ' + notification)
      return this.server.to(client.id).emit('getBadge', notification);
    } else {
      const notification = await this.notificationService.getBadgeNumber(0);
      console.log('notification = ' + notification)
      return this.server.emit('getBadge', notification);
    }
  }

  @SubscribeMessage('getNotifyList')
  async getNotifyList(client: Socket, req?: any) {
    console.log('api-gateway: getNotifyList..... + ' + client.data.agencyId)
    let notificationList;
    if (client.data.isAdmin) {
      notificationList = await this.notificationService.getAll(0);
    } else {
      notificationList = await this.notificationService.getAll(client.data.agencyId);
    }

    return this.server.to(client.id).emit('getNotifyList', notificationList);
  }

  @SubscribeMessage('deleteOrder')
  async deleteOrder(client: Socket, payload: any) {
    console.log('api-gateway: deleteOrder....' + JSON.stringify(client.data))
    const deletedOrder = await this.orderService.delete(payload);
    await this.server.to(client.id).emit('orderDeleted', deletedOrder);
    await this.emitGetOrderList(client);
  }

  async emitBadgeNumber(client: Socket) {
    return this.server.emit('emitBadgeNumber', 'emitBadgeNumber');
  }

  async emitNotifyList(client: Socket) {
    console.log('api-gateway: emitNotifyList..... + ' + client.data.agencyId)
    return this.server.emit('emitNotifyList', 'emitNotifyList');
  }

  async emitGetOrderList(client: Socket) {
    console.log('api-gateway: emitGetOrderList..... + ' + client.data.agencyId)
    return this.server.emit('emitGetOrderList', 'emitGetOrderList');
  }

  verifyJwt(jwt: string): Promise<any> {
    return this.jwtService.verifyAsync(jwt, { secret: this.configService.get('JWT_SECRET_KEY') });
  }

  async emitGetReportList(client: Socket) {
    console.log('api-gateway: emitGetReportList..... + ' + client.data.agencyId)
    return this.server.emit('emitGetReportList', 'emitGetReportList');
  }

  @SubscribeMessage('addReport')
  async onAddReport(client: Socket, payload: ModifyReportDTO) {
    console.log('api-gateway: onAddReport....' + JSON.stringify(client.data))
    const addReport = await this.reportService.create(payload);
    await this.server.to(client.id).emit('reportAdded', addReport);
    await this.emitGetReportList(client);
  }

  @SubscribeMessage('updateReport')
  async onUpdateReport(client: Socket, payload: ModifyReportDTO) {
    console.log('api-gateway: onUpdateReport....' + JSON.stringify(client.data))
    const updateReport = await this.reportService.update(payload);
    await this.server.to(client.id).emit('reportUpdated', updateReport);
    await this.emitGetReportList(client);
  }

  @SubscribeMessage('deleteReport')
  async deleteReport(client: Socket, payload: any) {
    console.log('api-gateway: deleteReport....' + JSON.stringify(client.data))
    const deleteReport = await this.reportService.delete(payload);
    await this.server.to(client.id).emit('reportDeleted', deleteReport);
    await this.emitGetReportList(client);
  }
}