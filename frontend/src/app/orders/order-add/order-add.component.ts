import { Component, OnInit } from '@angular/core';
import { AGENCY_ROLE, Cities, MSG_STATUS, RECEIPT, STATUS, STOCKER_ROLE, Transports, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Order, ProductItem } from '../../models/order';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Helper } from '../../helpers/helper';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SocketService } from '../../services/socket.service';
import { tap } from 'rxjs';
import { CONFIG } from '../../common/config';
import { CustomSocket } from '../../sockets/custom-socket';
import { Product } from '../../models/product';
import { OrderService } from '../../services/order.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-order-add',
  templateUrl: './order-add.component.html',
  styleUrls: ['./order-add.component.scss']
})
export class OrderAddComponent implements OnInit {
  readonly routingOrderList = CONFIG.APP_ROUTING.ORDER.ORDERS + CONFIG.APP_ROUTING.ORDER.LIST;

  header: string = 'Thêm mới đơn hàng';
  matcher = new MyErrorStateMatcher();

  cities: any[] = Cities;
  deliveries: any[] = [];
  productList: any[] = [];
  transport: any[] = Transports;
  status: any[] = STATUS;
  agencyList: any[] = [];
  receipt: any[] = RECEIPT;

  error: any = '';
  error1: any = '';
  deliveryError: any = '';
  pickupError: any = '';
  transportError: any = '';
  receiptError: any = '';
  helper = new Helper();
  isAdmin: boolean = this.helper.isAdmin();
  userRole: number = this.helper.getUserRole();
  isStocker: boolean = this.userRole === STOCKER_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;

  selectedStatus: any = { value: 1, label: '' };
  pickupSelected: any = null;
  deliverySelected: any = null;
  transportSelected: any = null;
  agencySelected: any = null;
  receiptSelected: any = null;

  order: Order = {
    id: 0,
    createdDate: this.helper.getDateFormat(2),
    deliveryId: 0,
    pickupId: 0,
    productTotal: 0,
    driver: '',
    note: '',
    transport: 0,
    receipt: 0,
    licensePlates: '',
    receivedDate: '',
    status: 0,
    contract: '',
    products: [],
    agencyId: 0,
    agencyName: '',
    approvedNumber: 0,
    editer: this.helper.getFullName(),
    confirmedDate: '',
    shippingDate: '',
  };

  date = new FormControl(new Date());
  loading: boolean = false;

  constructor(public router: Router,
    public dialog: MatDialog,
    public translate: TranslateService,
    private toastr: ToastrService,
    private socketService: SocketService,
    private socket: CustomSocket,
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
    this.emitSocket();
  }

  emitSocket() {
    this.socket.on('emitGetProductList', (response: Product[]) => {
      this.getFilterList();
    })
  }

  getFilterList() {
    this.orderService.getFilterList().subscribe((response: any) => {
      if (response) {
        this.agencyList = this.helper.sortAZ(response.agencyList, 'agencyName');
        this.productList = this.helper.sortAZ(response.productList, 'id');
        this.productList = this.helper.sortAZ(this.productList, 'category');
        this.deliveries = response.deliveryList;
        this.generalProductOrder();
        if (this.isAgency) {
          const agency = this.agencyList.find(x => x.id === this.helper.getAgencyId());
          this.order.contract = agency.contract;
        }
      }
    })
  }

  private generalProductOrder() {
    const list: ProductItem[] = [];
    this.productList.forEach(element => {
      const item = {
        id: element.id,
        name: element.name,
        quantity: '',
        category: element.category,
      };
      list.push(item);
    });
    this.order.products = list.sort((a, b) => a.category < b.category ? -1 : 1);
  }

  onSubmit() {
    this.loading = true;
    if (this.onValidationForm()) {
      this.order.status = Number(this.selectedStatus.value);
      this.order.deliveryId = Number(this.deliverySelected.id);
      this.order.pickupId = Number(this.pickupSelected.id);
      this.order.transport = Number(this.transportSelected.id);
      this.order.receipt = Number(this.receiptSelected.value);
      this.order.receivedDate = this.helper.getDateFormat(3, this.date.value);
      if (this.isAgency) {
        this.order.agencyId = this.helper.getAgencyId();
        this.order.notifyReceiver = 0;
      } else {
        this.order.agencyId = this.agencySelected !== null ? this.agencySelected.id : 0;
        this.order.notifyReceiver = this.order.agencyId;
      }
      this.order.sender = this.helper.getUserId();
      this.order.products = this.order.products.filter(x => x.quantity.toString() !== '0' && x.quantity.toString() !== '');

      if (this.order.status === STATUS[1].value) {
        this.order.confirmedDate = this.helper.getDateFormat(2);
      }
      if (this.order.status === STATUS[3].value) {
        this.order.shippingDate = this.helper.getDateFormat(2);
      }

      this.socketService.createdOrder(this.order).pipe(
        tap((res) => { })
      ).subscribe((response: any) => {
        this.loading = false;
        if (response) {
          this.order.id = response.id;
          this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_ORDER', MSG_STATUS.SUCCESS));
          this.router.navigate([this.routingOrderList]);
        } else {
          this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_ORDER', MSG_STATUS.FAIL));
        }
      });
    } else {
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate([this.routingOrderList]);
  }

  focusOut() {
    this.order.productTotal = 0;
    this.order.products.forEach(element => {
      this.order.productTotal += Number(element.quantity);
      this.order.productTotal = Math.round(this.order.productTotal * 100000000) / 100000000;
    });
  }

  onValidationForm(): boolean {
    let isValidForm: boolean = true;
    if (this.order.contract.length === 0
      || !this.deliverySelected
      || !this.pickupSelected
      || !this.transportSelected
      || !this.receiptSelected
      || this.order.licensePlates.length === 0
      || this.order.driver.length === 0) {
      isValidForm = false;
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    }
    if (!this.isAgency && !this.agencySelected) {
      isValidForm = false;
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    }
    if (!this.deliverySelected) {
      isValidForm = false;
      this.deliveryError = "Vui lòng chọn nơi nhận";
      document.getElementById("delivery")?.focus();
    } else {
      this.deliveryError = "";
    }
    if (!this.pickupSelected) {
      isValidForm = false;
      this.pickupError = "Vui lòng chọn nơi giao";
      document.getElementById("pickup")?.focus();
    } else {
      this.pickupError = "";
    }
    if (!this.transportSelected) {
      isValidForm = false;
      this.transportError = "Vui lòng chọn phương tiện vận chuyển";
      document.getElementById("transport")?.focus();
    }
    if (!this.receiptSelected) {
      isValidForm = false;
      this.receiptError = "Vui lòng chọn phương thức nhận";
      document.getElementById("receipt")?.focus();
    }
    if (this.order.productTotal === 0) {
      isValidForm = false;
      this.error1 = 'Vui lòng nhập số lượng sản phẩm';
      document.getElementById("quantity")?.focus();
    }

    return isValidForm;
  }

  onChange(event: any) {
    this.order.contract = event.contract;
  }

  onChangeTransport(event: any) {
    if (!this.transportSelected) {
      this.transportError = "Vui lòng chọn phương tiện vận chuyển";
      document.getElementById("transport")?.focus();
    } else {
      this.transportError = "";
    }
  }

  onChangePickup(event: any) {
    if (!this.pickupSelected) {
      this.pickupError = "Vui lòng chọn nơi giao";
      document.getElementById("pickup")?.focus();
    } else {
      this.pickupError = "";
    }
  }

  onChangeDelivery(event: any) {
    if (!this.deliverySelected) {
      this.deliveryError = "Vui lòng chọn nơi nhận";
      document.getElementById("pickup")?.focus();
    } else {
      this.deliveryError = "";
    }
  }

  onChangerReceipt(event: any) {
    if (!this.receiptSelected) {
      this.receiptError = "Vui lòng chọn phương thức nhận";
      document.getElementById("receipt")?.focus();
    } else {
      this.receiptError = "";
    }
  }

  onlyNumberKey(event: any) {
    return this.helper.onlyNumberKey(event);
  }

  focusNext(id: string) {
    document.getElementById(id)?.focus();
  }
}
