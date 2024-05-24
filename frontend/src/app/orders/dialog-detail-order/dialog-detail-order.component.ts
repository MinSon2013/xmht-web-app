import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AGENCY_ROLE, Cities, MSG_STATUS, RECEIPT, STATUS, Transports, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Order, ProductItem } from '../../models/order';
import { MyErrorStateMatcher } from '../order-add/order-add.component';
import { Helper } from '../../helpers/helper';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';
import { tap } from 'rxjs';
import { Product } from '../../models/product';
import { CustomSocket } from '../../sockets/custom-socket';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-dialog-detail-order',
  templateUrl: './dialog-detail-order.component.html',
  styleUrls: ['./dialog-detail-order.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DialogDetailOrderComponent implements OnInit {
  header: string = 'Thêm mới đơn hàng';
  matcher = new MyErrorStateMatcher();
  receivedDate: Date = new Date();
  error: any = '';
  error1: any = '';
  deliveryError: any = '';
  pickupError: any = '';
  transportError: any = '';
  receiptError: any = '';
  helper = new Helper();
  agencyId: number = this.helper.getAgencyId();

  cities: any[] = Cities;
  deliveries: any[] = [];
  productList: any[] = [];
  transport: any[] = Transports;
  status: any[] = STATUS;
  receipt: any[] = RECEIPT;
  agencyList: any[] = [];

  pickupSelected: any = null;
  deliverySelected: any = null;
  transportSelected: any = null;
  statusSelected: any = {};
  agencySelected: any = null;
  receiptSelected: any = null;

  order: Order = {
    id: 0,
    createdDate: '',
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
    editer: '',
    confirmedDate: '',
    shippingDate: '',
  };

  date = new Date();
  testForm!: FormGroup;
  loading: boolean = false;

  userRole: number = this.helper.getUserRole();
  isAdmin: boolean = this.helper.isAdmin();
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;
  disabled: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogDetailOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order | any,
    public dialog: MatDialog,
    public translate: TranslateService,
    private toastr: ToastrService,
    private socketService: SocketService,
    private socket: CustomSocket,
    private orderService: OrderService,
  ) { dialogRef.disableClose = true; }

  ngOnInit(): void {
    this.agencyList = this.data.agencyList ? this.data.agencyList : [];
    this.productList = this.data.productList ? this.data.productList : [];
    this.deliveries = this.data.deliveries ? this.data.deliveries : [];
    if (this.data.row && this.data.row.id !== 0) {
      this.mappingData(this.data.row, this.data.row.products);
    }
    this.emitSocket();
  }

  emitSocket() {
    this.socket.on('emitGetProductList', (response: Product[]) => {
      this.getOneOrder(this.data.row.id);
    })
    this.socket.on('emitGetOrderList', (response: Order[]) => {
      this.getOneOrder(this.data.row.id);
    })
  }

  getOneOrder(id: number) {
    this.orderService.getOneOrder(id).subscribe((response: any) => {
      if (response) {
        this.productList = response.productList;
        this.productList.sort((a, b) => (a.category < b.category ? -1 : 1));
        this.mappingData(response.order, response.products);
      } else {
        this.helper.showWarning(this.toastr, 'Không thể cập nhật thông tin đơn hàng do đơn hàng này đã xóa.');
        this.dialogRef.close(null);
      }
    });
  }

  mappingData(row: any, products: any[]) {
    this.header = 'Cập nhật thông tin đơn hàng';
    this.order.id = row.id;
    this.order.createdDate = row.createdDate;
    this.order.deliveryId = row.deliveryId;
    this.order.pickupId = row.pickupId;
    this.order.productTotal = row.productTotal;
    this.order.driver = row.driver;
    this.order.note = row.note;
    this.order.transport = row.transport;
    this.order.receipt = row.receipt;
    this.order.licensePlates = row.licensePlates;
    this.order.receivedDate = row.receivedDate;
    this.order.confirmedDate = row.confirmedDate;
    this.order.shippingDate = row.shippingDate;
    this.order.status = row.status;
    this.order.note = row.note;
    this.order.contract = row.contract;
    this.order.agencyId = row.agencyId;
    this.order.agencyName = row.agencyName;
    this.order.isViewed = row.isViewed;
    this.order.sender = row.sender;
    this.order.products = products;
    this.order.approvedNumber = row.approvedNumber;
    const status = this.status.find(x => x.value === this.order.status);
    this.statusSelected = status ? status : { id: null, label: '' };
    const delivery = this.deliveries.find(x => x.id === this.order.deliveryId);
    this.deliverySelected = delivery ? delivery : { id: null, label: '' };
    const pickup = this.cities.find(x => x.id === this.order.pickupId);
    this.pickupSelected = pickup ? pickup : { id: null, label: '' };
    const transport = this.transport.find(x => x.id === this.order.transport);
    this.transportSelected = transport ? transport : { id: null, label: '' };
    const agency = this.agencyList.find(x => x.id === this.order.agencyId);
    this.agencySelected = agency ? agency : { id: null, label: '' };
    const receipt = this.receipt.find(x => x.value === this.order.receipt);
    this.receiptSelected = receipt ? receipt : { id: null, label: '' };
    this.setProductOrder(this.order.products);

    // set valuefor receivedDate picker
    const [day, month, year] = this.order.receivedDate.split('/');
    const date = new Date(+year, +month - 1, +day);
    this.testForm = new FormGroup({
      date: new FormControl(date),
    })

    if (this.order.status === STATUS[0].value
      || (this.order.status === STATUS[1].value && (this.isAdmin || this.isSalesman)
      )) {
      this.disabled = false;
    } else {
      this.disabled = true;
    }
    if (this.order.status === STATUS[1].value && (!this.isAdmin && !this.isSalesman)) {
      this.header = 'Chi tiết đơn hàng';
    }
  }

  setProductOrder(product: any[]) {
    const products: any[] = product;
    this.order.products = this.productList;
    let listMap = this.order.products.map((e, i) => {
      let temp = products.find(element => element.id === e.id)
      if (temp) {
        e.quantity = temp.quantity;
      } else {
        e.quantity = '';
      }
      return e;
    });

    const list: ProductItem[] = [];
    listMap.forEach(element => {
      const item = {
        id: element.id,
        name: element.name,
        quantity: element.quantity,
        category: element.category,
      };
      list.push(item);
    });
    this.order.products = list;
  }

  onSubmit() {
    if (this.onValidationForm()) {
      this.order.status = this.statusSelected.value;
      this.order.deliveryId = Number(this.deliverySelected.id);
      this.order.pickupId = Number(this.pickupSelected.id);
      this.order.transport = Number(this.transportSelected.id);
      this.order.receipt = Number(this.receiptSelected.value);
      this.order.products = this.order.products.filter(x => x.quantity && x.quantity.toString() !== '0' && x.quantity.toString() !== '');
      this.order.receivedDate = this.helper.getDateFormat(3, this.testForm.value.date);
      this.order.agencyId = this.agencySelected.id;
      if (!this.order.isViewed) {
        if ((this.agencyId === this.order.agencyId) || this.isAdmin) {
          this.order.isViewed = true;
        } else {
          this.order.isViewed = false;
        }
      }
      if (this.isAdmin) {
        this.order.notifyReceiver = this.order.agencyId;
      } else {
        this.order.notifyReceiver = 0;
      }
      this.order.userUpdated = this.helper.getUserId();
      this.order.editer = this.helper.getFullName();
      if (this.order.status === STATUS[1].value) {
        this.order.confirmedDate = this.helper.getDateFormat(2);
        this.order.shippingDate = '';
      }
      if (this.order.status === STATUS[3].value) {
        this.order.shippingDate = this.helper.getDateFormat(2);
      }
      this.socketService.updatedOrder(this.order).pipe(
        tap((res) => { })
      ).subscribe((response: any) => {
        if (response.affected && response.affected !== 0) {
          this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_ORDER', MSG_STATUS.SUCCESS));
          this.dialogRef.close(this.order);
        } else if (response.code === 404) {
          this.helper.showWarning(this.toastr, 'Không thể cập nhật thông tin đơn hàng do đơn hàng này đã được duyệt.');
          this.dialogRef.close(null);
        } else {
          this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_ORDER', MSG_STATUS.FAIL));
          this.dialogRef.close(null);
        }
      });
    } else {
    }
  }

  onCancel() {
    if (!this.order.isViewed) {
      if (this.agencyId === this.order.agencyId || this.isAdmin) {
        this.order.isViewed = true;
      } else {
        this.order.isViewed = false;
      }
      const payload = {
        id: this.order.id,
        isViewed: this.order.isViewed,
      };
      this.socketService.changeIsViewedOrder(payload);
    }
    this.dialogRef.close(null);
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
      || !this.agencySelected
      || !this.deliverySelected
      || !this.pickupSelected
      || !this.transportSelected
      || !this.receiptSelected
      || this.order.licensePlates.length === 0
      || this.order.driver.length === 0) {
      isValidForm = false;
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    }
    if (!this.deliverySelected) {
      isValidForm = false;
      this.deliveryError = "Vui lòng chọn nơi nhận";
      document.getElementById("delivery")?.focus();
    }
    if (!this.pickupSelected) {
      isValidForm = false;
      this.pickupError = "Vui lòng chọn nơi giao";
      document.getElementById("pickup")?.focus();
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

  onChangeReceipt(event: any) {
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