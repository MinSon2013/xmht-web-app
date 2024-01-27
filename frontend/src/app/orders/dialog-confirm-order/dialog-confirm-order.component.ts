import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AGENCY_ROLE, Cities, MSG_STATUS, RECEIPT, STATUS, STOCKER_ROLE, Transports, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Order } from '../../models/order';
import { Helper } from '../../helpers/helper';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';

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
    @Inject(MAT_DIALOG_DATA) public data: Order | any,
    public translate: TranslateService,
    private toastr: ToastrService,
    private socketService: SocketService,
  ) { dialogRef.disableClose = true; }

  ngOnInit(): void {
    this.agencyList = this.data.agencyList ? this.data.agencyList : [];
    this.productList = this.data.productList ? this.data.productList : [];
    this.deliveries = this.data.deliveries ? this.data.deliveries : [];
    if (this.data.row && this.data.row.id !== 0) {
      this.order.id = this.data.row.id;
      this.order.createdDate = this.data.row.createdDate;
      this.order.deliveryId = this.data.row.deliveryId;
      this.order.pickupId = this.data.row.pickupId;
      this.order.productTotal = this.data.row.productTotal;
      this.order.driver = this.data.row.driver;
      this.order.note = this.data.row.note;
      this.order.transport = this.data.row.transport;
      this.order.receipt = this.data.row.receipt;
      this.order.licensePlates = this.data.row.licensePlates;
      this.order.receivedDate = this.data.row.receivedDate;
      this.order.status = this.data.row.status;
      this.order.note = this.data.row.note;
      this.order.products = this.data.row.products;
      this.order.contract = this.data.row.contract;
      this.order.sender = this.data.row.sender;
      this.order.isViewed = this.data.row.isViewed;
      this.order.agencyId = this.data.row.agencyId;
      this.order.confirmedDate = this.data.row.confirmedDate;
      this.order.shippingDate = this.data.row.shippingDate;
      // this.order.approvedNumber = this.data.row.approvedNumber !== 0 ? this.data.row.approvedNumber : 0;
      this.order.approvedNumber = this.data.row.approvedNumber;
      this.order.agencyName = this.agencyList.find(x => x.id === this.data.row.agencyId).agencyName;
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
