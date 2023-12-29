import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ADMIN_ROLE, AGENCY_ROLE, Cities, MSG_STATUS, RECEIPT, STATUS, STOCKER_ROLE, Transports, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Order } from '../../models/order';
import { Helper } from '../../helpers/helper';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-confirm-order',
  templateUrl: './dialog-confirm-order.component.html',
  styleUrls: ['./dialog-confirm-order.component.scss']
})
export class DialogConfirmOrderComponent implements OnInit {

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
    @Inject(MAT_DIALOG_DATA) public data: Order,
    public translate: TranslateService,
    private toastr: ToastrService,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this.productList = this.helper.getProductList();
    this.agencyList = this.helper.getAgencyList();
    this.deliveries = this.helper.getDeliveryList();
    if (this.data && this.data.id !== 0) {
      this.order.id = this.data.id;
      this.order.createdDate = this.data.createdDate;
      this.order.deliveryId = this.data.deliveryId;
      this.order.pickupId = this.data.pickupId;
      this.order.productTotal = this.data.productTotal;
      this.order.driver = this.data.driver;
      this.order.note = this.data.note;
      this.order.transport = this.data.transport;
      this.order.receipt = this.data.receipt;
      this.order.licensePlates = this.data.licensePlates;
      this.order.receivedDate = this.data.receivedDate;
      this.order.status = this.data.status;
      this.order.note = this.data.note;
      this.order.products = this.data.products;
      this.order.contract = this.data.contract;
      this.order.sender = this.data.sender;
      this.order.isViewed = this.data.isViewed;
      this.order.agencyId = this.data.agencyId;
      this.order.confirmedDate = this.data.confirmedDate;
      this.order.shippingDate = this.data.shippingDate;
      this.order.approvedNumber = this.data.approvedNumber !== 0 ? this.data.approvedNumber : 0;
      this.order.agencyName = this.agencyList.find(x => x.id === this.data.agencyId).agencyName;
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
        this.helper.updateStatusOrder(this.order.id, this.order.status);
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
