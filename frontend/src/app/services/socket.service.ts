import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notify } from '../models/notify';
import { Order } from '../models/order';
import { CustomSocket } from '../sockets/custom-socket';
import { Reports } from '../models/report';
import { Product } from '../models/product';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    constructor(private socket: CustomSocket) {
        socket.on('disconnected', (s: any) => {
            console.log('disconnected')
        });

        socket.on('disconnect', (s: string) => {
            console.log('disconnect');
            console.log(s);
        });

        socket.on("connect", (s: any) => {
            console.log("connect");
        });

        socket.on("connection", (s: any) => {
            console.log("connection");
            let count = 0;
            setInterval(() => {
                this.socket.emit("ping", ++count);
            }, 1000);
        });

        socket.on("connect_error", (s: any) => {
            console.log('connect_error');
        });

        socket.on("connect_timeout", (s: any) => {
            console.log('connect_timeout');
            setTimeout(() => {
                this.socket.connect();
            }, 1000);
        });
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

    createdNotification(notify: Notify) {
        this.socket.emit('addNotify', notify);
        return new Observable((subscribe) => {
            this.socket.on('emitNotifyAdded', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    updatedNotification(notify: Notify) {
        this.socket.emit('updateNotify', notify);
        return new Observable((subscribe) => {
            this.socket.on('emitNotifyUpdatedToClient', (data: any) => {
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
            this.socket.on('emitOrderAdded', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    updatedOrder(order: Order) {
        this.socket.emit('updateOrder', order);
        return new Observable((subscribe) => {
            this.socket.on('emitOrderUpdated', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    deleteOrder(id: number) {
        this.socket.emit('deleteOrder', id);
        return new Observable((subscribe) => {
            this.socket.on('emitOrderDeleted', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    changeStatusOrder(request: any) {
        this.socket.emit('changeStatusOrder', request);
        return new Observable((subscribe) => {
            this.socket.on('emitStatusOrderChanged', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    changeIsViewedOrder(request: any) {
        this.socket.emit('changeIsViewedOrder', request);
    }

    emitLogOut() {
        this.socket.emit('logOut');
    }

    createdReport(obj: Reports) {
        const report = {
            storeId: obj.storeId,
            agencyId: obj.agencyId,
            districtId: obj.districtId,
            provinceId: obj.provinceId,
            storeInformation: obj.storeInformation,
            reportContent: obj.reportContent,
            otherStoreName: obj.otherStoreName,
            attachFile: obj.attachFile,
            filePath: obj.filePath,
            note: obj.note,
            fullName: obj.fullName,
            updatedByUserId: obj.updatedByUserId,
        };
        this.socket.emit('addReport', report);
        return new Observable((subscribe) => {
            this.socket.on('emitReportAdded', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    updatedReport(obj: Reports) {
        const report = {
            id: obj.id,
            storeId: obj.storeId,
            agencyId: obj.agencyId,
            districtId: obj.districtId,
            provinceId: obj.provinceId,
            storeInformation: obj.storeInformation,
            reportContent: obj.reportContent,
            otherStoreName: obj.otherStoreName,
            attachFile: obj.attachFile,
            filePath: obj.filePath,
            note: obj.note,
            fullName: obj.fullName,
            updatedByUserId: obj.updatedByUserId,
        };
        this.socket.emit('updateReport', report);
        return new Observable((subscribe) => {
            this.socket.on('emitReportUpdatedToClient', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    deleteReport(id: number) {
        this.socket.emit('deleteReport', id);
        return new Observable((subscribe) => {
            this.socket.on('emitReportDeleted', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    createdProduct(product: Product | any) {
        this.socket.emit('addProduct', product);
        return new Observable((subscribe) => {
            this.socket.on('emitProductAdded', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    updatedProduct(product: Product | any) {
        this.socket.emit('updateProduct', product);
        return new Observable((subscribe) => {
            this.socket.on('emitProductUpdatedToClient', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    deleteProduct(id: number) {
        this.socket.emit('deleteProduct', id);
        return new Observable((subscribe) => {
            this.socket.on('emitProductDeleted', (data: any) => {
                subscribe.next(data);
            });
        })
    }

    socketOnOrderAdded(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitOrderAdded', (data: any) => {
                console.log("emitOrderAdded")
                subscribe.next(data);
            });
        })
    }

    socketOnOrderUpdated(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitOrderUpdated', (data: any) => {
                console.log("emitOrderUpdated")
                subscribe.next(data);
            });
        })
    }

    socketOnOrderDeleted(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitOrderDeleted', (data: any) => {
                console.log("emitOrderDeleted")
                subscribe.next(data);
            });
        })
    }

    socketOnOrderStatusChanged(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitStatusOrderChanged', (data: any) => {
                console.log("emitStatusOrderChanged")
                subscribe.next(data);
            });
        })
    }

    socketOnOrderIsViewedChanged(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitIsViewOrderChanged', (data: any) => {
                console.log("emitIsViewOrderChanged")
                subscribe.next(data);
            });
        })
    }

    socketOnGetProductList(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitGetProductList', (data: any) => {
                console.log("emitGetProductList")
                subscribe.next(data);
            });
        })
    }

    socketOnProductUpdated(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitProductUpdated', (data: any) => {
                console.log("emitProductUpdated")
                subscribe.next(data);
            });
        })
    }

    socketOnGetReportList(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitGetReportList', (data: any) => {
                console.log("emitGetReportList")
                subscribe.next(data);
            });
        })
    }

    socketOnReportUpdated(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitReportUpdated', (data: any) => {
                console.log("emitReportUpdated")
                subscribe.next(data);
            });
        })
    }

    socketOnNotifyUpdated(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitNotifyUpdated', (data: any) => {
                console.log("emitNotifyUpdated")
                subscribe.next(data);
            });
        })
    }

    socketOnNotifyCRUD(): Observable<any> {
        return new Observable((subscribe) => {
            this.socket.on('emitNotifyCRUD', (data: any) => {
                console.log("emitNotifyCRUD")
                subscribe.next(data);
            });
        })
    }

}
