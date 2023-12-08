import { animate, style, transition, trigger, keyframes } from "@angular/animations";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { CONFIG } from "../common/config";
import { Agency } from "../models/agency";
import { Delivery } from "../models/delivery";
import { LoginInfo } from "../models/login-info";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { ProductOrder } from "../models/product-order";
import { User } from "../models/user";
import jwt_decode from "jwt-decode";
import { STATUS } from "../constants/const-data";

export interface INavbarData {
  routeLink: string;
  icon?: string;
  label: string,
  expanded?: boolean;
  items?: INavbarData[];
}

export interface ICity {
  value: number;
  label: string;
}

export interface ITransport {
  value: number;
  label: string;
}

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('350ms',
      style({ opacity: 1 })
    )
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('350ms',
      style({ opacity: 0 })
    )
  ])
])

export const rotate = trigger('rotate', [
  transition(':enter', [
    animate('1000ms',
      keyframes([
        style({ transform: 'rotate(0deg)', offset: '0' }),
        style({ transform: 'rotate(2turn)', offset: '1' })
      ])
    )
  ])
])

export class Helper {

  isExpireToken() {
    const token = localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN);
    if (token) {
      const now = new Date();
      const decode: any = jwt_decode(token!);
      const expireDate = new Date(decode.exp * 1000);
      if (expireDate >= now) {
        return true;
      }
    }
    this.clearSession();
    return false;
  }

  checkSession() {
    let appHeader = document.getElementById('app-header');
    let appSidenav = document.getElementById('app-sidenav');
    let appLogin = document.getElementById('login-container');
    if (localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN)) {
      appHeader ? appHeader.hidden = false : '';
      appSidenav ? appSidenav.hidden = false : '';
      appLogin ? appLogin.hidden = true : '';
      return true;
    } else {
      appHeader ? appHeader.hidden = true : '';
      appSidenav ? appSidenav.hidden = true : '';
      appLogin ? appLogin.hidden = false : '';
      return false;
    }
  }

  getAccessToken() {
    const token = localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN);
    if (token) {
      return token;
    }
    return '';
  }

  clearSession() {
    localStorage.clear();
  }

  isAdmin(): boolean {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      if (!json.isAdmin) {
        return false;
      }
    }
    return true;
  }

  isStocker(): boolean {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      if (!json.isStocker) {
        return false;
      }
    }
    return true;
  }

  getInfoName(): string {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return json.accountName;
    }
    return '';
  }

  getUserId(): number {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return Number(json.userId);
    }
    return 0;
  }

  getAgencyId(): number {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return Number(json.agencyId);
    }
    return 0;
  }

  getMenuList(): INavbarData[] {
    let menuList: INavbarData[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.MENU_LIST);
    if (jsonString) {
      menuList = JSON.parse(jsonString) as INavbarData[];
    }
    return menuList;
  }

  getDeliveryList(): Delivery[] {
    let deliveryList: Delivery[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.DELIVERY_LIST);
    if (jsonString) {
      deliveryList = JSON.parse(jsonString) as Delivery[];
    }
    return deliveryList;
  }

  setOrderList(data: any[]) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE.ORDER_LIST, JSON.stringify(data));
  }

  getOrderList(): Order[] {
    let orderList: Order[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.ORDER_LIST);
    if (jsonString) {
      orderList = JSON.parse(jsonString) as Order[];
      orderList.forEach(item => {
        switch (item.status) {
          case 1:
            item.statusLabel = STATUS[0].label;
            break;
          case 2:
            item.statusLabel = STATUS[1].label;
            break;
          case 3:
            item.statusLabel = STATUS[2].label;
            break;
          case 4:
            item.statusLabel = STATUS[3].label;
            break;
          case 5:
            item.statusLabel = STATUS[4].label;
            break;
        }
      });
    }
    return orderList;
  }

  updateStatusOrder(id: number, status: number) {
    let orderList = this.getOrderList();
    if (orderList.length > 0) {
      orderList.forEach(element => {
        if (element.id === id) {
          element.status = status;
        }
      });
      localStorage.setItem(CONFIG.LOCAL_STORAGE.ORDER_LIST, JSON.stringify(orderList));
    }
  }

  updateOrder(obj: any) {
    let orderList = this.getOrderList();
    if (orderList.length > 0) {
      const order = orderList.find(x => x.id === obj.id);
      if (order) {
        order.createdDate = obj.createdDate;
        order.deliveryId = obj.deliveryId;
        order.pickupId = obj.pickupId;
        order.productTotal = obj.productTotal;
        order.driver = obj.driver;
        order.note = obj.note;
        order.transport = obj.transport;
        order.licensePlates = obj.licensePlates;
        order.receivedDate = obj.receivedDate;
        order.status = obj.status;
        order.note = obj.note;
        order.products = obj.products;
        order.contract = obj.contract;
        order.agencyId = obj.agencyId;
      }

      localStorage.setItem(CONFIG.LOCAL_STORAGE.ORDER_LIST, JSON.stringify(orderList));
    }
  }

  addOrder(data: any) {
    let orderList = this.getOrderList();
    orderList.push(data);
    localStorage.setItem('orderList', JSON.stringify(orderList));
  }

  deleteOrder(obj: any) {
    let orderList = this.getOrderList();
    if (orderList.length > 0) {
      orderList = orderList.filter(x => x.id !== obj.id);
      localStorage.setItem(CONFIG.LOCAL_STORAGE.ORDER_LIST, JSON.stringify(orderList));
    }
  }

  getAgencyList(): Agency[] {
    let agencyList: Agency[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.AGENCY_LIST);
    if (jsonString) {
      agencyList = JSON.parse(jsonString) as Agency[];
      const userList = this.getUserList();
      agencyList.forEach(element => {
        const user = userList.find(x => x.id === element.userId);
        element.accountName = user ? user.username : '';
        element.password = user ? user.password : '';
      });
    }
    return agencyList;
  }

  updateAgency(obj: any) {
    let agencyList = this.getAgencyList();
    if (agencyList.length > 0) {
      agencyList.forEach(element => {
        if (element.id === obj.id) {
          element.address = obj.address;
          element.contract = obj.contract;
          element.email = obj.email;
          element.fullName = obj.fullName;
          element.note = obj.note;
          element.phone = obj.phone;
        }
      });
      localStorage.setItem(CONFIG.LOCAL_STORAGE.AGENCY_LIST, JSON.stringify(agencyList));
    }
  }

  addAgency(data: any) {
    let agencyList = this.getAgencyList();
    agencyList.push(data);
    localStorage.setItem(CONFIG.LOCAL_STORAGE.AGENCY_LIST, JSON.stringify(agencyList));
  }

  deleteAgency(obj: any) {
    let agencyList = this.getAgencyList();
    if (agencyList.length > 0) {
      agencyList = agencyList.filter(x => x.id !== obj.id);
      localStorage.setItem(CONFIG.LOCAL_STORAGE.AGENCY_LIST, JSON.stringify(agencyList));
    }
  }

  setProductList(data: any[]) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_LIST, JSON.stringify(data));
  }

  getProductList(): Product[] {
    let productList: Product[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.PRODUCT_LIST);
    if (jsonString) {
      productList = JSON.parse(jsonString) as Product[];
    }
    return productList;
  }

  getProductSum(): any[] {
    let productSum: any[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.PRODUCT_SUM);
    if (jsonString) {
      productSum = JSON.parse(jsonString);
    }
    return productSum;
  }

  updateProduct(obj: any) {
    let productList = this.getProductList();
    if (productList.length > 0) {
      productList.forEach(element => {
        if (element.id === obj.id) {
          element.name = obj.name;
          element.quantity = obj.quantity;
          element.price = obj.price;
        }
      });
      localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_LIST, JSON.stringify(productList));
    }
  }

  addProduct(data: any) {
    let productList = this.getProductList();
    productList.push(data);
    localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_LIST, JSON.stringify(productList));
  }

  deleteProduct(obj: any) {
    let productList = this.getProductList();
    if (productList.length > 0) {
      productList = productList.filter(x => x.id !== obj.id);
      localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_LIST, JSON.stringify(productList));
    }
  }

  getProductOrderList(): ProductOrder[] {
    let productOrderList: ProductOrder[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.PRODUCT_ORDER_LIST);
    if (jsonString) {
      productOrderList = JSON.parse(jsonString) as ProductOrder[];
    }
    return productOrderList;
  }

  updateProductOrder(obj: any) {
    let productOrderList = this.getProductOrderList();
    if (productOrderList.length > 0) {
      productOrderList.forEach(element => {
        if (element.productId === obj.productId && element.orderId === obj.orderId) {
          element.quantity = obj.quantity;
        }
      });
      localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_ORDER_LIST, JSON.stringify(productOrderList));
    }
  }

  addProductOrder(data: ProductOrder[]) {
    let productOrderList = this.getProductOrderList();
    productOrderList = data.concat(productOrderList);
    localStorage.setItem(CONFIG.LOCAL_STORAGE.PRODUCT_ORDER_LIST, JSON.stringify(productOrderList));
  }

  getUserList(): User[] {
    let userList: User[] = [];
    let jsonString = localStorage.getItem(CONFIG.LOCAL_STORAGE.USER_LIST);
    if (jsonString) {
      userList = JSON.parse(jsonString) as User[];
    }
    return userList;
  }

  setAgencyList(agencyList: Agency[]) {
    const userList = this.getUserList();
    agencyList.forEach(element => {
      const user = userList.find(x => x.id === element.userId);
      element.accountName = user ? user.username : '';
      element.password = user ? user.password : '';
    });
    localStorage.setItem(CONFIG.LOCAL_STORAGE.AGENCY_LIST, JSON.stringify(agencyList));
  }

  addUser(data: User) {
    let userList = this.getUserList();
    userList = [data].concat(userList);
    localStorage.setItem(CONFIG.LOCAL_STORAGE.USER_LIST, JSON.stringify(userList));
  }

  getMessage(translate: TranslateService, key: string, status: number, content?: string): string {
    let msg: string = '';
    if (status === 1) {
      translate.get(key).subscribe(x => {
        msg = x + " thành công";
      });
    } else if (status === 2) {
      translate.get(key).subscribe(x => {
        msg = x + " xảy ra lỗi";
      });
    } else {
      translate.get(key).subscribe(x => {
        msg = x;
      });
    }
    return msg;
  }

  showSuccess(toastr: ToastrService, msg: string, title?: string) {
    toastr.success(msg);
  }

  showError(toastr: ToastrService, msg: string, title?: string) {
    toastr.error(msg);
  }

  showWarning(toastr: ToastrService, msg: string, title?: string) {
    toastr.warning(msg);
  }
}

