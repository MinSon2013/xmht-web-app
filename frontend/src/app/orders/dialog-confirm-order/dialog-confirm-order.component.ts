import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AGENCY_ROLE, Cities, MSG_STATUS, RECEIPT, STATUS, STOCKER_ROLE, Transports, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Order } from '../../models/order';
import { Helper } from '../../helpers/helper';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-dialog-confirm-order',
  templateUrl: './dialog-confirm-order.component.html',
  styleUrls: ['./dialog-confirm-order.component.scss']
})
export class DialogConfirmOrderComponent implements OnInit, OnDestroy {

  helper: Helper = new Helper();
  order: Order = {
    id: 0,
    createdDate: '',
    selectedDelivery: '',
    deliveryId: 0,
    selectedPickup: '',
    pickupId: 0,
    productTotal: 0,
    driver: '',
    note: '',
    transport: 0,
    receipt: 0,
    selectedTransport: '',
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

  cities: any[] = Cities;
  deliveries: any[] = [];
  productList: any[] = [];
  transport: any[] = Transports;
  status: any[] = STATUS;
  receipt: any[] = RECEIPT;
  agencyList: any[] = [];

  userRole: number = this.helper.getUserRole();
  isAdmin: boolean = this.helper.isAdmin();
  isStocker: boolean = this.userRole === STOCKER_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;

  selectedStatus: any = {};
  selectedDelivery: any = {};
  selectedPickup: any = {};
  selectedTransport: any = {};
  selectedReceipt: any = null;

  constructor(public dialogRef: MatDialogRef<DialogConfirmOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order | any,
    public translate: TranslateService,
    private toastr: ToastrService,
    private socketService: SocketService,
    private orderService: OrderService,
  ) { dialogRef.disableClose = true; }

  ngOnInit(): void {
    this.agencyList = this.data.agencyList ? this.data.agencyList : [];
    this.productList = this.data.productList ? this.data.productList : [];
    this.deliveries = this.data.deliveries ? this.data.deliveries : [];
    if (this.data.row && this.data.row.id !== 0) {
      this.mappingData(this.data.row, this.data.row.products);

      this.emitSocket();
    }
  }

  private mappingData(row: any, products: any[]) {
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
    this.order.status = row.status;
    this.order.note = row.note;
    this.order.products = products.sort((a: any, b: any) => a.category < b.category ? -1 : 1);
    this.order.contract = row.contract;
    this.order.sender = row.sender;
    this.order.isViewed = row.isViewed;
    this.order.agencyId = row.agencyId;
    this.order.confirmedDate = row.confirmedDate;
    this.order.shippingDate = row.shippingDate;
    this.order.approvedNumber = row.approvedNumber;
    this.order.agencyName = this.agencyList.find(x => x.id === row.agencyId).agencyName;
    const status = this.status.find(x => x.value === this.order.status);
    this.selectedStatus = status ? status : { id: null, label: '' };
    const delivery = this.deliveries.find(x => x.id === this.order.deliveryId);
    this.selectedDelivery = delivery ? delivery : { id: null, label: '' };
    const pickup = this.cities.find(x => x.id === this.order.pickupId);
    this.selectedPickup = pickup ? pickup : { id: null, label: '' };
    const transport = this.transport.find(x => x.id === this.order.transport);
    this.selectedTransport = transport ? transport : { id: null, label: '' };
    const receipt = this.receipt.find(x => x.value === this.order.receipt);
    this.selectedReceipt = receipt ? receipt : { id: null, label: '' };
  }

  emitSocket() {
    // Listening updated order
    this.socketService.socketOnOrderUpdated().subscribe((result) => {
      this.getOneOrder(this.data.row.id);
    });

    // Listening order status changed
    this.socketService.socketOnOrderStatusChanged().subscribe((result) => {
      this.getOneOrder(this.data.row.id);
    });
  }

  ngOnDestroy(): void { }

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

  onSubmit() {
    this.order.status = this.selectedStatus.value;
    if (!this.order.isViewed) {
      if (this.helper.getAgencyId() === this.order.agencyId) {
        this.order.isViewed = true;
      } else {
        this.order.isViewed = false;
      }
    }
    if (this.order.status === STATUS[3].value) {
      this.order.shippingDate = this.helper.getDateFormat(2);
    }

    const payload = {
      id: this.order.id,
      isViewed: this.order.isViewed,
      status: this.order.status,
      sender: this.helper.getUserId(),
      agencyId: this.order.agencyId,
      userUpdated: this.helper.getUserId(),
      shippingDate: this.order.shippingDate,
      note: this.order.note,
      editor: this.helper.getFullName(),
    };

    this.socketService.changeStatusOrder(payload).subscribe((response: any) => {
      if (response.affected !== 0) {
        this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_ORDER', MSG_STATUS.SUCCESS));
        this.dialogRef.close(this.order);
      } else {
        this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_ORDER', MSG_STATUS.FAIL));
        this.dialogRef.close(null);
      }
    });
  }

  onCancel() {
    if (!this.order.isViewed) {
      if (this.helper.getAgencyId() === this.order.agencyId
        || this.isAdmin
        || this.isStocker
        || this.isSalesman) {
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
}
