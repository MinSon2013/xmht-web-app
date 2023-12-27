import { Component, OnInit } from '@angular/core';
import { Cities, MSG_STATUS, RECEIPT, STATUS, Transports } from '../../constants/const-data'; 
import { Order, ProductItem } from '../../models/order';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Helper } from '../../helpers/helper';
import { ErrorStateMatcher } from '@angular/material/core';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SocketService } from '../../services/socket.service';
import { tap } from 'rxjs';

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
  isAdmin: boolean = new Helper().isAdmin();
  isStocker: boolean = new Helper().isStocker();

  selectedStatus: any = { value: 1, label: '' };
  pickupSelected: any = null;
  deliverySelected: any = null;
  transportSelected: any = null;
  agencySelected: any = null;
  receiptSelected: any = null; 

  order: Order = {
    id: 0,
    createdDate: moment().format('HH:mm DD/MM/YYYY'),
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

  date = new FormControl(new Date());
  helper = new Helper();
  loading: boolean = false;

  constructor(public router: Router,
    public dialog: MatDialog,
    public translate: TranslateService,
    private toastr: ToastrService,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this.agencyList = this.helper.getAgencyList();
    this.productList = this.helper.getProductList();
    this.deliveries = this.helper.getDeliveryList();

    this.setProductOrder();
    if (!this.helper.isAdmin()) {
      this.order.contract = this.agencyList[0].contract;
    }
  }

  setProductOrder() {
    const list: ProductItem[] = [];
    this.productList.forEach(element => {
      const item = {
        id: element.id,
        name: element.name,
        quantity: '',
      };
      list.push(item);
    });
    list.sort((a, b) => (a.id < b.id ? -1 : 1));
    this.order.products = list;
  }

  onSubmit() {
    this.loading = true;
    if (this.onValidationForm()) {
      this.order.status = Number(this.selectedStatus.value);
      this.order.deliveryId = Number(this.deliverySelected.id);
      this.order.pickupId = Number(this.pickupSelected.id);
      this.order.transport = Number(this.transportSelected.id);
      this.order.receipt = Number(this.receiptSelected.value); 
      this.order.receivedDate = moment(this.date.value).format('DD/MM/YYYY');
      if (this.isAdmin) {
        this.order.agencyId = this.agencySelected !== null ? this.agencySelected.id : 0;
        this.order.notifyReceiver = this.order.agencyId;
      } else {
        this.order.agencyId = this.helper.getAgencyId();
        this.order.notifyReceiver = 0;
      }
      this.order.sender = this.helper.getAgencyId();
      this.order.products = this.order.products.filter(x => x.quantity.toString() !== '0' && x.quantity.toString() !== '');

      if (this.order.status === STATUS[1].value) { 
        this.order.confirmedDate = moment().format('HH:mm DD/MM/YYYY'); 
      }
      if (this.order.status === STATUS[3].value) { 
        this.order.shippingDate = moment().format('HH:mm DD/MM/YYYY');
      }
      console.log(this.order)
      this.socketService.createdOrder(this.order).pipe(
        tap((res) => { })
      ).subscribe((response: any) => {
        this.loading = false;
        if (response) {
          this.order.id = response.id;
          this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_ORDER', MSG_STATUS.SUCCESS));
          this.router.navigate(['orders/list']);
        } else {
          this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_ORDER', MSG_STATUS.FAIL));
        }
      });
    } else {
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate(['orders/list']);
  }

  focusOut() {
    this.order.productTotal = 0;
    this.order.products.forEach(element => {
      this.order.productTotal += Number(element.quantity);
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
    if (this.isAdmin && !this.agencySelected) {
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
    var ASCIICode = (event.which) ? event.which : event.keyCode;
    if (ASCIICode > 31 
      && (ASCIICode < 48 || ASCIICode > 57)
      && (ASCIICode < 96 || ASCIICode > 105)
      && ASCIICode !== 110
      && ASCIICode !== 190) {
      return false;
    }
    return true;
  }
}
