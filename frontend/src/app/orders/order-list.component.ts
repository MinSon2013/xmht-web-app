import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Order } from '../models/order';
import { DialogDetailOrderComponent } from './dialog-detail-order/dialog-detail-order.component';
import { Helper } from '../helpers/helper';
import { DialogConfirmOrderComponent } from './dialog-confirm-order/dialog-confirm-order.component';
import { AGENCY_ROLE, Cities, SERVICE_TYPE, STATUS, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../constants/const-data';
import { CustomPaginator } from '../common/custom-paginator';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx-js-style';
import { CustomSocket } from '../sockets/custom-socket';
import { ExcelConfig } from '../helpers/excel.config';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class OrderListComponent implements OnInit {

  displayedColumns: string[] = ['approvedNumber', 'agencyName', 'contract', 'createdDate', 'receivedDate', 'confirmedDate', 'shippingDate', 'deliveryId', 'pickupId', 'productName', 'quantity', 'productTotal', 'licensePlates', 'driver', 'status', 'deleteAction'];
  colspan: number = 0;
  dataSource = new MatTableDataSource<Order>();
  dataSourceClone = new MatTableDataSource<Order>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  cities: any[] = Cities;
  deliveries: any[] = [];
  productList: any[] = [];
  agencyList: any[] = [];
  status: any[] = STATUS;
  helper = new Helper();
  isAdmin: boolean = this.helper.isAdmin();
  agencyId: number = this.helper.getAgencyId();
  userRole: number = this.helper.getUserRole();
  isStocker: boolean = this.userRole === STOCKER_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;

  agencySelected: any = null;
  productSelected: any = null;
  selectedStatus: any = null;

  hasData: boolean = false;
  fileNameExcel: string = 'Danh-sach-don-dat-hang.xlsx';

  searchForm: any = {
    orderId: 0,
    agencyId: 0,
    productId: 0,
    status: 0,
    startDate: '',
    endDate: ''
  }

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  sticky: boolean = true;

  constructor(public dialog: MatDialog,
    public router: Router,
    private orderService: OrderService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private socket: CustomSocket,
    private deviceService: DeviceDetectorService,
  ) {
    this.epicFunction();
  }

  ngOnInit(): void {
    if (this.isAreaManager) {
      this.displayedColumns = ['approvedNumber', 'agencyName', 'contract', 'createdDate', 'receivedDate', 'confirmedDate', 'shippingDate', 'deliveryId', 'pickupId', 'productName', 'quantity', 'productTotal', 'licensePlates', 'driver', 'status'];
    }
    if (this.isAgency) {
      this.displayedColumns = ['approvedNumber', 'contract', 'createdDate', 'receivedDate', 'confirmedDate', 'shippingDate', 'deliveryId', 'pickupId', 'productName', 'quantity', 'productTotal', 'licensePlates', 'driver', 'status'];
    }
    this.colspan = this.displayedColumns.length;
    this.productList = this.helper.getProductList();
    this.agencyList = this.helper.getAgencyList();
    this.deliveries = this.helper.getDeliveryList();

    this.getData();
    this.emitSocket();
  }

  getData() {
    this.orderService.getOrderList().subscribe((response: any) => {
      if (response.length > 0) {
        this.helper.setOrderList(response.reverse());
        this.dataSource.data = []
        this.dataSource.data = response.length > 0 ? response : [];
        this.dataSource.data.forEach(x => {
          x.agencyName = this.agencyList.find(i => i.id === x.agencyId)?.agencyName;
          x.products.sort((a, b) => (a.id < b.id ? -1 : 1));
        });
        if (this.isStocker) {
          this.dataSource.data = this.dataSource.data.filter(
            x => x.status === STATUS[1].value
              || x.status === STATUS[2].value
              || x.status === STATUS[3].value
          );
        }
      } else {
        this.dataSource.data = [];
      }

      if (this.dataSource.data.length === 0) {
        this.hasData = false;
      } else {
        this.hasData = true;
      }
      this.dataSourceClone = new MatTableDataSource<Order>(this.dataSource.data);
    });
  }

  emitSocket() {
    this.socket.on('emitGetOrderList', (response: Order[]) => {
      this.getData();
    })
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  @HostListener('click', ['$event'])
  onClick(event: any) {
    const element = document.getElementsByClassName('mat-mdc-paginator-page-size-label');
    if (element.length > 0) {
      element[0].innerHTML = 'Số dòng hiển thị: ';
    }
  }

  onAdd() {
    this.router.navigate(['orders/add']);
  }

  onEdit(row: any) {
    const elements = Array.from(
      document.getElementsByClassName('body') as HTMLCollectionOf<HTMLElement>,
    );
    if (row && row.status !== 1 || this.isAreaManager) {
      const dialogRef = this.dialog.open(DialogConfirmOrderComponent, {
        data: row,
      });

      elements.forEach(el => {
        el.style.position = 'fixed';
      });

      dialogRef.afterClosed().subscribe(result => {
        elements.forEach(el => {
          el.style.position = 'relative';
        });
      });
    } else {
      const dialogRef = this.dialog.open(DialogDetailOrderComponent, {
        data: row,
      });

      elements.forEach(el => {
        el.style.position = 'fixed';
      });

      dialogRef.afterClosed().subscribe(result => {
        elements.forEach(el => {
          el.style.position = 'relative';
        });
      });
    }
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.ORDERSERVICE, content: 'Bạn chắc chắn muốn xóa đơn hàng này không?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.helper.deleteOrder(row);
        this.dataSource.data = this.dataSource.data.filter(x => x.id !== row.id);
        if (this.dataSource.data.length === 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
        }
      }
    });
  }

  onPrint(row: any) {
    this.router.navigate(['print'], row);
  }

  exportToExcel() {
    /* flatten objects to string array */
    let rows: any[] = [];
    const title = ['', '', '', '', '', 'DANH SÁCH ĐƠN HÀNG', '', '', '', '', '', '', '', ''];
    const empty = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const header = ['Mã số đơn hàng', 'Ngày tạo đơn', 'Nhà phân phối', 'Hợp đồng', 'Ngày nhận dự kiến', 'Ngày xác nhận', 'Ngày giao hàng', 'Nơi nhận', 'Nơi giao', 'Sản phẩm', 'Số lượng',
      'Tổng số lượng', 'Số phương tiện', 'Tên tài xế'];
    rows.push(title);
    rows.push(empty);
    rows.push(header);

    this.dataSource.data.forEach(e => {
      const row: any[] = [];
      row.push(e.approvedNumber !== 0 ? e.approvedNumber.toString() : "-");
      row.push(e.createdDate);
      row.push(this.agencyList.find(x => x.id === e.agencyId)?.agencyName);
      row.push(e.contract);
      row.push(e.receivedDate);
      row.push(e.confirmedDate);
      row.push(e.shippingDate);
      row.push(this.deliveries.find(x => x.id === e.deliveryId) ? this.deliveries.find(x => x.id === e.deliveryId).label : '');
      row.push(this.cities.find(x => x.id === e.pickupId) ? this.cities.find(x => x.id === e.pickupId).label : '');
      row.push(this.getProductName(e.products));
      row.push(this.getProductQuantity(e.products));
      row.push(Number(e.productTotal));
      row.push(e.licensePlates);
      row.push(e.driver);
      rows.push(row);
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    ws['!merges'] = [{ s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }];
    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    XLSX.utils.book_append_sheet(wb, ws, 'DS Đơn hàng');

    /* calculate column width */
    const max_width_2 = rows.reduce((w, r) => Math.max(w, r[1].length), 12);
    const max_width_3 = rows.reduce((w, r) => Math.max(w, r[2].length), 17);
    const max_width_4 = rows.reduce((w, r) => Math.max(w, r[3].length), 17);
    const max_width_5 = rows.reduce((w, r) => Math.max(w, r[4].length), 15);
    const max_width_6 = rows.reduce((w, r) => Math.max(w, r[4].length), 15);
    const max_width_7 = rows.reduce((w, r) => Math.max(w, r[4].length), 15);
    const max_width_8 = rows.reduce((w, r) => Math.max(w, r[5] ? r[5].length : 0), 15);
    const max_width_9 = rows.reduce((w, r) => Math.max(w, r[6] ? r[6].length : 0), 15);
    const max_width_10 = rows.reduce((w, r) => Math.max(w, r[7].length / 2), 15);
    const max_width_13 = rows.reduce((w, r) => Math.max(w, r[10].length), 15);
    const max_width_14 = rows.reduce((w, r) => Math.max(w, r[11].length), 15);
    const wscols = [
      { wch: 10 },
      { wch: max_width_2 },
      { wch: max_width_3 },
      { wch: max_width_4 },
      { wch: max_width_5 },
      { wch: max_width_6 },
      { wch: max_width_7 },
      { wch: max_width_8 },
      { wch: max_width_9 },
      { wch: max_width_10 },
      { wch: 15 },
      { wch: 15 },
      { wch: max_width_13 },
      { wch: max_width_14 },
    ];
    ws['!cols'] = wscols;

    // Format style for cells
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r + 3; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        // Style for rows
        const all = XLSX.utils.encode_cell({ c: C, r: R });
        if (ws[all]) {
          ws[all].s = ExcelConfig.generalStyle;
        }

        // Style for row 0
        const row0 = XLSX.utils.encode_cell({ c: C, r: 0 });
        if (ws[row0]) {
          delete ws[row0].w;
          ws[row0].s = ExcelConfig.titleStyle;
        }

        // Style for row 1
        const row1 = XLSX.utils.encode_cell({ c: C, r: 2 });
        if (ws[row1]) {
          ws[row1].s = ExcelConfig.headerStyle;
        }
      }

      // Style for column of product name
      const col6 = XLSX.utils.encode_cell({ c: 6, r: R });
      ws[col6].s = ExcelConfig.generalStyle;

      // Style for column of product name
      const col7 = XLSX.utils.encode_cell({ c: 7, r: R });
      ws[col7].s = ExcelConfig.styleCol78;

      // Style for column of product quantity
      const col8 = XLSX.utils.encode_cell({ c: 8, r: R });
      ws[col8].s = ExcelConfig.styleCol78;


      // Style for column of id
      const col0 = XLSX.utils.encode_cell({ c: 0, r: R });
      ws[col0].s = ExcelConfig.numberStyle;

      // Style for column of product quantity, total
      const col8n = XLSX.utils.encode_cell({ c: 8, r: R });
      ws[col8n].s = ExcelConfig.numberStyle;
      const col9 = XLSX.utils.encode_cell({ c: 9, r: R });
      ws[col9].s = ExcelConfig.numberStyle;
    }

    XLSX.writeFile(wb, this.fileNameExcel, { cellStyles: true });
  }

  getProductName(products: any[]): string {
    let str = '';
    products.forEach(el => {
      str += el.name + '\n';
    });
    return str.trimEnd();
  }

  getProductQuantity(products: any[]): string {
    let str = '';
    products.forEach(el => {
      str += el.quantity + '\n';
    });
    return str.trimEnd();
  }

  onSearch() {
    this.searchForm.agencyId = this.agencySelected !== null ? this.agencySelected.id : 0;
    this.searchForm.productId = this.productSelected !== null ? this.productSelected.id : 0;
    this.searchForm.status = this.selectedStatus !== null ? this.selectedStatus.value : 0;
    this.searchForm.startDate = this.range.value.start !== null ? moment(this.range.value.start).format('DD/MM/YYYY') : '';
    this.searchForm.endDate = this.range.value.end !== null ? moment(this.range.value.end).format('DD/MM/YYYY') : '';
    this.orderService.search(this.searchForm).subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response.reverse();
        this.dataSource.data.forEach(x => {
          x.agencyName = this.agencyList.find(i => i.id === x.agencyId)?.agencyName;
        });
        this.dataSourceClone = new MatTableDataSource<Order>(this.dataSource.data);
        this.hasData = true;
        this.resetFormSearch();
      } else {
        this.dataSource.data = [];
        this.hasData = false;
        this.helper.showWarning(this.toastr, "Không có thông tin cần tìm.");
        this.resetFormSearch();
      }
    });
  }

  onLoadLasted(key: number) {
    this.dataSource.data = this.dataSourceClone.data;
    const nowDate = moment(new Date(), 'HH:mm DD/MM/YYYY');
    const subDate = nowDate.subtract(7, 'days');
    const newList = this.dataSource.data.filter(x => x.status === key && subDate < (moment(x.createdDate, 'HH:mm DD/MM/YYYY')));
    if (newList.length > 0) {
      this.dataSource.data = newList;
    } else {
      this.helper.showWarning(this.toastr, "Không có thông tin cần tìm.");
    }
  }

  resetFormSearch() {
    this.agencySelected = null;
    this.productSelected = null;
    this.selectedStatus = null;
    this.range.reset();
    this.searchForm.approvedNumber = 0;
    this.searchForm.agencyId = 0;
    this.searchForm.productId = 0;
    this.searchForm.status = 0;
    this.searchForm.startDate = null;
    this.searchForm.endDate = null;
  }

  compareObj(obj1: any[], obj2: any): string {
    const obj = obj1.find(x => x.id === obj2);
    if (obj) {
      return obj.label;
    }
    return '';
  }

  private epicFunction() {
    const deviceInfo = this.deviceService.getDeviceInfo();
    switch (deviceInfo.deviceType) {
      case "mobile":
        this.sticky = false;
        break;
      case "tablet":
        this.sticky = true;
        break;
      case "desktop":
        this.sticky = true;
        break;
      default:
        this.sticky = true;
    }
  }

}
