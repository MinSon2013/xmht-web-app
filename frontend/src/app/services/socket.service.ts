import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notify } from '../models/notify';
import { Order } from '../models/order';
import { CustomSocket } from '../sockets/custom-socket';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    constructor(private socket: CustomSocket) {
        socket.on('disconnected', (s: any) => {
            console.log('disconnected')
            //this.socket.connect();
        });

        socket.on('disconnect', (s: string) => {
            console.log('disconnect');//
            console.log(s);
            //this.socket.connect();
        });

        socket.on("connect", (s: any) => {
            console.log("connect");//
          });

        socket.on("connection", (s: any) => {
            console.log("connection");
            let count = 0;
            setInterval(() => {
                this.socket.emit("ping", ++count);
            }, 1000);
        });

        socket.on("connect_error", (s: any) => {
            console.log('connect_error');//
            // setTimeout(() => {
            //     this.socket.connect();
            // }, 1000);
        });

        socket.on("connect_timeout", (s: any) => {
            console.log('connect_timeout');//
            setTimeout(() => {
                this.socket.connect();
            }, 1000);
        });
    }

    openConnect() {
        this.socket.connect();
    }

    createdNotification(notify: Notify) {
        this.socket.emit('addNotify', notify);
        return new Observable((subscribe) => {
            this.socket.on('notifyAdded', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    updatedNotification(notify: Notify) {
        this.socket.emit('updateNotify', notify);
        return new Observable((subscribe) => {
            this.socket.on('notifyUpdated', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    changeStatusNotify(request: any) {
        this.socket.emit('changeStatusNotify', request);
    }

    createdOrder(order: Order) {
        this.socket.emit('addOrder', order);
        return new Observable((subscribe) => {
            this.socket.on('orderAdded', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    updatedOrder(order: Order) {
        this.socket.emit('updateOrder', order);
        return new Observable((subscribe) => {
            this.socket.on('orderUpdated', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    changeStatusOrder(request: any) {
        this.socket.emit('changeStatusOrder', request);
        return new Observable((subscribe) => {
            this.socket.on('statusOrderChanged', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    changeIsViewedOrder(request: any) {
        this.socket.emit('changeIsViewedOrder', request);
    }

    emitGetBadge(agencyId: number) {
        this.socket.emit('getBadge', { agencyId });
    }

    emitGetNotifications(agencyId: number) {
        this.socket.emit('getNotifyList', { agencyId });
    }

    emitGetOrderList(agencyId: number, dateTime?: string) {
        if (dateTime) {
            this.socket.emit('getOrderList', { agencyId, dateTime });
        } else {
            this.socket.emit('getOrderList', { agencyId });
        }
    }

    getNotifications(agencyId: number): Observable<Notify[]> {
        return new Observable((subscribe) => {
            this.socket.on('getNotifyList', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    getOrderList(): Observable<Order[] | any[]> {
        return new Observable((subscribe) => {
            this.socket.on('getOrderList', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    emitLogOut() {
        this.socket.emit('logOut');
    }

    listen(eventName: string) {
        return new Observable((subscribe) => {
            this.socket.on(eventName, (data: any) => {
                subscribe.next(data);
            })
        })
    }

    emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }

    deleteOrder(id: number) {
        this.socket.emit('deleteOrder', id);
        return new Observable((subscribe) => {
            this.socket.on('orderDeleted', (data: any) => {
                subscribe.next(data);
            });
        })
    }
}
