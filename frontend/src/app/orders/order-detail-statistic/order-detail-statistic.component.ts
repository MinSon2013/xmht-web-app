import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import { MatTableDataSource } from '@angular/material/table';
import { AGENCY_ROLE, Cities, PRODUCT_CATEGORIES, RECEIPT } from '../../constants/const-data';
import { Product } from '../../models/product';
import { Helper } from '../../helpers/helper';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchDetailsOrder } from '../../models/search';
import * as XLSX from 'xlsx-js-style';
import { ExcelDetailsConfig } from '../../helpers/excel-details.config';
import { ProductService } from '../../services/product.service';
import { CustomSocket } from '../../sockets/custom-socket';

@Component({
  selector: 'app-order-detail-statistic',
  templateUrl: './order-detail-statistic.component.html',
  styleUrls: ['./order-detail-statistic.component.scss']
})
export class OrderDetailStatisticComponent implements OnInit, OnDestroy {
  private helper = new Helper();
  isAgency: boolean = this.helper.getUserRole() === AGENCY_ROLE;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  showDetailOrderTable: boolean = false;
  progressLoading: boolean = true;
  fileNameExcel: string = "Bang-chi-tiet-xuat-hang-theo-ma-so.xlsx";

  cities: any[] = Cities;
  receipt: any[] = RECEIPT;
  deliveries: any[] = [];
  productList: Product[] = [];
  customerList: any[] = [];
  driverList: any[] = [];
  licensePlateList: any[] = [];

  customerSelected: any = null;
  receivedAdressSelected: any = null;
  receiptSelected: any = null;
  productSelected: any = null;
  driverSelected: any = null;
  licensePlateSelected: any = null;

  /** Defined column section1 */
  colDefSection: string[] = ['no', 'customer', 'createDate', 'contract', 'receivedDate', 'confirmDate', 'shippingDate', 'deliveryAddress', 'pickupAddress'];
  columnsRow1Section: string[] = [...this.colDefSection, 'products', 'receipt', 'sum', 'license_plate', 'driver'];
  columnsRowProductCategory: string[] = [];
  columnsRowProductName: string[] = [];
  displayedColumnsProductName: { id: number, label: string, value: string }[] = [];
  displayedColumnsSection: string[] = [];
  columnDefRowSumSection: string[] = [];
  displayedRowSumSection: { label: string, value: number }[] = [];
  dataSource = new MatTableDataSource<any>();

  thRowspan: number = 3;
  thColspan: number = 0;

  dataSourceObject: {
    no: number,
    customer: string,
    createdDate: string,
    contract: string,
    receivedDate: string,
    confirmedDate: string,
    shippingDate: string,
    pickupAddress: string,
    driver: string,
    deliveryAddress: string,
    licensePlate: string,
    receipt: string,
    products: { pId: number, pValue: string }[],
    sum: string,
  }[] = [];

  productDataSource: {
    categoryValue: string,
    displayedCategory: string,
    pColspan: number,
    productList: { pId: number, pCategory: number, pName: string }[],
  }[] = [];

  searchForm: SearchDetailsOrder = {
    agencyId: "",
    deliveryId: "",
    pickupId: "",
    licensePlate: '',
    driver: '',
    receipt: '',
    status: '',
    productId: '',
    startDate: '',
    endDate: '',
    userId: 0,
  }

  nowDay: string = "";
  fromToDate: string = "Từ ngày.....................đến ngày.....................";
  customer: string = "";

  constructor(
    public router: Router,
    private orderService: OrderService,
    public translate: TranslateService,
    private socket: CustomSocket,
    private productService: ProductService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) {
  }

  ngOnDestroy(): void {
  }

  ngOnInit() {
    this.getFilterList();
    this.initHeader();
    this.emitSocket();
  }

  emitSocket() {
    this.socket.on('emitGetOrderList', (response: Product[]) => {
      this.setDisplayedColumns();
    });
    this.socket.on('emitGetProductList', (response: Product[]) => {
      this.getProductList();
    })
  }

  getProductList() {
    this.productService.getProductList().subscribe((response: any) => {
      if (response.length > 0) {
        this.productList = response;
        this.productList.sort((a, b) => (a.category > b.category ? -1 : 1));
        this.onShow();
      } else {
        this.productList = [];
      }
    });
  }

  onShow() {
    this.progressLoading = true;
    this.showDetailOrderTable = false;
    this.fromToDate = `Từ ngày ${this.helper.getDateFormat(3, this.range.value.start)} đến ngày ${this.helper.getDateFormat(3, this.range.value.end)}`;
    this.searchForm.agencyId = this.customerSelected ? this.customerSelected.id : "";
    this.searchForm.startDate = this.range.value.start !== null ? this.helper.getDateFormat(3, this.range.value.start) : "";
    this.searchForm.endDate = this.range.value.end !== null ? this.helper.getDateFormat(3, this.range.value.end) : "";
    this.searchForm.deliveryId = this.receivedAdressSelected ? this.receivedAdressSelected.id : "";
    this.searchForm.licensePlate = this.licensePlateSelected ? this.licensePlateSelected : "";
    this.searchForm.driver = this.driverSelected ? this.driverSelected : "";
    this.searchForm.receipt = this.receiptSelected ? this.receiptSelected.value : "";
    this.searchForm.productId = this.productSelected ? this.productSelected.id : "";
    if (this.isAgency) {
      this.searchForm.agencyId = this.helper.getAgencyId() + "";
    }
    this.autoScrollView();
    console.time('setDisplayedColumns')
    this.setDisplayedColumns();
    console.timeEnd('setDisplayedColumns')
  }

  resetFormSearch() {
    this.invalid();
    // Reset search filter
    this.receivedAdressSelected = null;
    this.receiptSelected = null;
    this.productSelected = null;
    this.driverSelected = null;
    this.licensePlateSelected = null;
  }

  invalid() {
    if (this.range.value.start !== null || this.range.value.end !== null) {
      this.fromToDate = `Từ ngày ${this.helper.getDateFormat(3, this.range.value.start)} đến ngày ${this.helper.getDateFormat(3, this.range.value.end)}`;
      this.range.reset();
    } else {
      this.fromToDate = "Từ ngày.....................đến ngày.....................";
    }

    if (this.customerSelected) {
      this.customer = "   " + this.customerSelected?.agencyName;
      this.customerSelected = null;
    } else {
      this.customer = "";
    }
    if (this.isAgency) {
      this.customer = "   " + this.helper.getAgencyName();
    }
  }

  getFilterList() {
    this.orderService.getFilterList().subscribe((response: any) => {
      if (response) {
        this.customerList = response.agencyList;
        this.productList = response.productList;
        this.productList.sort((a, b) => (a.category < b.category ? -1 : 1));
        this.deliveries = response.deliveryList;
        let licensePlateList = response.licensePlateList;
        let driverList = response.driverList;

        let mapList = new Map(driverList.map((s: string) => [s.trim().toLowerCase(), s]));
        driverList = [...mapList.values()];
        let mapList1 = new Map(licensePlateList.map((s: string) => [s.trim().toLowerCase(), s]));
        licensePlateList = [...mapList1.values()];
        this.licensePlateList = this.sortAZ(licensePlateList);
        this.driverList = this.sortAZ(driverList);

        this.progressLoading = false;
      }
    });
  }

  sortAZ(array: any[]) {
    return array.sort(function (a, b) {
      var nameA = a.toLowerCase(), nameB = b.toLowerCase();
      if (nameA < nameB) //sort string ascending
        return -1;
      if (nameA > nameB)
        return 1;
      return 0; //default return value (no sorting)
    });
  }

  private initHeader() {
    const dFormat = this.helper.getDateFormat(3);
    const m = dFormat.split('/');
    this.nowDay = `..........., ngày ${m[0]} tháng ${m[1]} năm ${m[2]}`;

    if (this.isAgency) {
      this.customer = "   " + this.helper.getAgencyName();
    }
  }

  onChangeCustomer(event: any) {
    this.customer = "   " + this.customerSelected?.agencyName;
  }

  private setDisplayedColumns() {
    this.productDataSource = [];
    this.columnsRowProductCategory = [];
    this.columnsRowProductName = [];
    this.displayedColumnsSection = [];

    const replacements = [
      [" SƯ TỬ", ""],
      [" Sư Tử", ""],
      [" Sư tử", ""],
      [" sư tử", ""],
      [" PHỤ TỬ", ""],
      [" Phụ Tử", ""],
      [" Phụ tử", ""],
      [" phụ tử", ""],
      [" XÁ", ""],
      [" Xá", ""],
      [" xá", ""],
    ];

    let sutuList: { pId: number, pCategory: number, pName: string }[] = [];
    let phutuList: { pId: number, pCategory: number, pName: string }[] = [];
    let xaList: { pId: number, pCategory: number, pName: string }[] = [];
    let khacList: { pId: number, pCategory: number, pName: string }[] = [];
    this.thColspan = this.productList.length;

    /** Phan tung loai san pham */
    /** Replacement product name for displayed columns */
    let subProductList = this.groupByValue(this.productList, 'category');
    subProductList.forEach((e: any) => {
      switch (e[0].category) {
        case PRODUCT_CATEGORIES[0].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            sutuList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          this.productDataSource.push({
            displayedCategory: PRODUCT_CATEGORIES[0].label,
            categoryValue: PRODUCT_CATEGORIES[0].value.toString(),
            productList: sutuList,
            pColspan: sutuList.length,
          });
          this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[0].value.toString());
          break;
        case PRODUCT_CATEGORIES[1].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            phutuList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          this.productDataSource.push({
            displayedCategory: PRODUCT_CATEGORIES[1].label,
            categoryValue: PRODUCT_CATEGORIES[1].value.toString(),
            productList: phutuList,
            pColspan: phutuList.length,
          });
          this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[1].value.toString());
          break;
        case PRODUCT_CATEGORIES[2].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            xaList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          this.productDataSource.push({
            displayedCategory: PRODUCT_CATEGORIES[2].label,
            categoryValue: PRODUCT_CATEGORIES[2].value.toString(),
            productList: xaList,
            pColspan: xaList.length,
          });
          this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[2].value.toString());
          break;
        case PRODUCT_CATEGORIES[3].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            khacList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          this.productDataSource.push({
            displayedCategory: PRODUCT_CATEGORIES[3].label,
            categoryValue: PRODUCT_CATEGORIES[3].value.toString(),
            productList: khacList,
            pColspan: khacList.length,
          });
          this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[3].value.toString());
          break;
      }
    });

    /** Displayed column product name  */
    const arrProduct = [...sutuList, ...phutuList, ...xaList, ...khacList];
    this.columnsRowProductName = arrProduct.map(p => p.pCategory.toString() + "." + arrProduct.indexOf(p));
    this.displayedColumnsProductName = arrProduct.map(p =>
    ({
      id: p.pId,
      label: p.pCategory.toString() + "." + arrProduct.indexOf(p),
      value: p.pName
    })
    );

    /** Handle columndef for section1 */
    this.displayedColumnsSection = [...this.colDefSection, ...this.columnsRowProductName, 'receipt', 'sum', 'license_plate', 'driver']
    this.changeDetectorRefs.detectChanges();

    this.setDataSourceSection();
  }

  private setDataSourceSection() {
    this.dataSourceObject = [];
    let sumCol: any[] = [];
    const productTemplate = this.displayedColumnsProductName.map(x => ({ pId: x.id, pValue: "", pCategory: x.label }));
    this.orderService.searchDetails(this.searchForm).subscribe((response: any) => {
      if (response.length > 0) {
        /** Mapping data cell for Section 1 */
        /*** Hanled datasource for display on a cell */
        response.forEach((x: any) => {
          x.agencyName = this.customerList.find(i => i.id === x.agencyId)?.agencyName;
          let receipt = this.receipt.find(i => i.value === x.receipt);
          let products = productTemplate.map(x => ({ ...x }));
          x.products.forEach((k: any) => {
            products.map(y => {
              if (y.pId === k.id) {
                y.pValue = k.quantity;
              }
            });
          });

          this.dataSourceObject.push({
            no: x.approvedNumber,
            customer: x.agencyName ? x.agencyName : this.helper.getAgencyName(),
            deliveryAddress: this.compareObj(this.deliveries, x.deliveryId),
            licensePlate: x.licensePlates.trim(),
            receipt: receipt ? receipt.label : "",
            products: products,
            sum: x.productTotal.toString(),
            createdDate: this.replaceTextInDate(x.createdDate),
            contract: x.contract.trim(),
            receivedDate: x.receivedDate,
            confirmedDate: this.replaceTextInDate(x.confirmedDate),
            shippingDate: this.replaceTextInDate(x.shippingDate),
            pickupAddress: this.cities.find(k => k.id === x.pickupId) ? this.cities.find(k => k.id === x.pickupId).label : "",
            driver: x.driver.trim(),
          });
          sumCol = [...sumCol, ...products];
        });

        this.columnDefRowSumSection = [];
        this.displayedRowSumSection = [];

        /** Set sum value footẻ of every product */
        let subSumColsSection = this.groupByValue(sumCol, 'pCategory');
        // Sum all of sum
        let sumAll1 = this.helper.sum(this.dataSourceObject, 'sum');

        this.dataSource.data = this.dataSourceObject;
        let sumColRow1 = productTemplate.map(x => ({ ...x }));
        subSumColsSection.forEach((e: any) => {
          this.columnDefRowSumSection.push(e[0].pCategory + ".s" + subSumColsSection.indexOf(e));
          let sum = this.helper.sum(e, 'pValue');
          sumColRow1.map(y => {
            if (y.pId === e[0].pId) {
              y.pValue = sum + "";
            }
          });
        });

        sumColRow1.forEach(e => {
          this.displayedRowSumSection.push({ label: e.pCategory + ".s" + sumColRow1.indexOf(e), value: Number(e.pValue) });
        });

        this.columnDefRowSumSection.push("s" + (this.thColspan + 1));
        this.columnDefRowSumSection.push("s" + (this.thColspan + 2));
        this.columnDefRowSumSection = ['footer-row-label', ...this.columnDefRowSumSection];
        this.displayedRowSumSection.push({ label: "s" + (this.thColspan + 1), value: 0 });
        this.displayedRowSumSection.push({ label: "s" + (this.thColspan + 2), value: sumAll1 });

      } else {
        this.dataSource.data = [];
        this.columnDefRowSumSection = [];
        this.displayedRowSumSection = [];
        productTemplate.forEach(e => {
          this.columnDefRowSumSection.push("s" + productTemplate.indexOf(e));
          this.displayedRowSumSection.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
        });

        this.columnDefRowSumSection.push("s" + (this.thColspan + 1));
        this.columnDefRowSumSection = ['footer-row-label', ...this.columnDefRowSumSection];
        this.displayedRowSumSection.push({ label: "s" + (this.thColspan + 1), value: 0 });
      }
      this.showDetailOrderTable = true;
      this.progressLoading = false;
    });
  }

  private compareObj(obj1: any[], obj2: any): string {
    const obj = obj1.find(x => x.id === obj2);
    if (obj) {
      return obj.label;
    }
    return '';
  }

  private groupByValue(arr: any[], key: string) {
    return Object.values(arr.reduce((acc, curr) => {
      if (!acc[curr[key]]) acc[curr[key]] = [];
      acc[curr[key]].push(curr)
      return acc;
    }, {}));
  }

  getClass(categoryValue: string) {
    let k = categoryValue.split(".");
    let cls: string = "";
    switch (Number(k[0])) {
      case 1:
        cls = "text-flowerblue";
        break;
      case 2:
        cls = "text-red";
        break;
      case 3:
        cls = "text-green";
        break;
      case 4:
        cls = "text-grey";
        break;
    }
    return cls;
  }

  autoScrollView() {
    const element = document.getElementById("excelTabel");
    element?.scrollIntoView();
  }

  onExportExcel() {
    /* flatten objects to string array */
    let rows: any[] = [];
    const titleRight: string = "BẢNG CHI TIẾT XUẤT HÀNG THEO MÃ SỐ";
    const titleCenter: string = "BÁO CÁO CHI TIẾT";
    const leftHeader = [
      'Mã số',
      'Khách hàng',
      'Ngày tạo đơn',
      'Hợp đồng',
      'Ngày nhận\n dự kiến',
      'Ngày xác nhận\n đơn hàng',
      'Ngày giao hàng',
      'Nơi nhận',
      'Nơi giao',
    ];
    const rightHeader = ['Phương thức\n nhận', 'Tổng từng\n đơn hàng', 'Phương tiện', 'Tên tài xế'];

    // Convert header of table excel
    let productType: string[] = [];
    let productName: string[] = [];
    let productTemplate: string[] = [];
    this.displayedColumnsProductName.forEach(x => {
      let type = this.productDataSource.find(k => k.categoryValue === x.label.split('.')[0]);
      if (type) {
        productType.push(type.displayedCategory);
      }
      productName.push(x.value);
      productTemplate.push('Sản phẩm');
    });
    const headerExcel = [...leftHeader, ...productTemplate, ...rightHeader];
    let productTypeHeaderExcel = [...leftHeader, ...productType, ...rightHeader];
    let productNameHeaderExcel = [...leftHeader, ...productName, ...rightHeader];

    let headerColumnRight1: string[] = [];
    let headerColumnRight2: string[] = [];
    let footerColumnRight1: string[] = [];
    let footerColumnRight2: string[] = [];
    let headerCustomer: string[] = ['Tên khách hàng', '', this.customer, '', '', '', '', '', '', titleCenter];
    let emptyRow = ['', '', '', '', '', '', '', '', '', '', '', '', '',];

    // Convert last row SUM
    let lastRowSum: string[] = [];
    leftHeader.forEach(f => {
      headerColumnRight1.push("");
      headerColumnRight2.push("");
      footerColumnRight1.push("");
      footerColumnRight2.push("");
      lastRowSum.push("Tổng cộng");
    });
    for (let i = 0; i < productName.length; i++) {
      headerColumnRight1.push("");
      headerColumnRight2.push("");
      footerColumnRight1.push("");
      footerColumnRight2.push("");
    }
    headerColumnRight1.push(titleRight);
    headerColumnRight2.push(this.fromToDate);
    footerColumnRight1.push(this.nowDay);
    footerColumnRight2.push("Người lập");
    for (let i = 0; i < leftHeader.length; i++) {
      headerColumnRight1.push("");
      headerColumnRight2.push("");
      footerColumnRight1.push("");
      footerColumnRight2.push("");
      headerCustomer.push("");
    }
    this.displayedRowSumSection.forEach(k => {
      lastRowSum.push(k.value > 0 ? k.value.toString() : "");
    });
    lastRowSum.push("");
    lastRowSum.push("");

    rows.push(emptyRow);
    rows.push(headerColumnRight1);
    rows.push(headerColumnRight2);
    rows.push(headerCustomer);
    rows.push(emptyRow);

    const topRowNumber = rows.length;
    rows.push(headerExcel);
    rows.push(productTypeHeaderExcel);
    rows.push(productNameHeaderExcel);
    // Convert data into a cell of body Excel
    this.dataSource.data.forEach(e => {
      const row: any[] = [];
      row.push(e.no !== 0 ? e.no.toString() : "-"); // Cell 0
      row.push(e.customer); // Cell 1
      row.push(this.replaceTextInDate(e.createdDate)); // Cell 2
      row.push(e.contract); // Cell 3
      row.push(e.receivedDate); // Cell 4
      row.push(this.replaceTextInDate(e.confirmedDate)); // Cell 5
      row.push(this.replaceTextInDate(e.shippingDate)); // Cell 6
      row.push(e.deliveryAddress); // Cell 7
      row.push(e.pickupAddress); // Cell 8

      // Convert cell for cell products
      e.products.forEach((p: any) => {
        row.push(p.pValue); // Cell 9......n
      });

      row.push(e.receipt); // Cell 10
      row.push(e.sum); // Cell 11
      row.push(e.licensePlate); // Cell 12
      row.push(e.driver); // Cell 13

      // Push row child to parent 
      rows.push(row);
    });
    rows.push(lastRowSum);
    rows.push(footerColumnRight1);
    rows.push(footerColumnRight2);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    /** Merge Cell */
    // row index 0 -> ....
    // column index 0 -> ...
    let colMiddleIdx = leftHeader.length + productName.length;
    let mergeColRow = [];
    mergeColRow.push({ s: { r: 1, c: colMiddleIdx }, e: { r: 1, c: colMiddleIdx + (rightHeader.length - 1) } });
    mergeColRow.push({ s: { r: 2, c: colMiddleIdx }, e: { r: 2, c: colMiddleIdx + (rightHeader.length - 1) } });
    mergeColRow.push({ s: { r: 3, c: leftHeader.length }, e: { r: 3, c: (leftHeader.length + 4) } });
    mergeColRow.push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } });
    for (let i = 0; i < leftHeader.length; i++) {
      mergeColRow.push({ s: { r: topRowNumber, c: i }, e: { r: topRowNumber + 2, c: i } });
    }
    for (let j = colMiddleIdx; j < (colMiddleIdx + rightHeader.length); j++) {
      mergeColRow.push({ s: { r: topRowNumber, c: j }, e: { r: topRowNumber + 2, c: j } });
    }
    mergeColRow.push({ s: { r: topRowNumber, c: leftHeader.length }, e: { r: topRowNumber, c: (colMiddleIdx - 1) } });
    let column = leftHeader.length;
    this.productDataSource.forEach(k => {
      mergeColRow.push({ s: { r: topRowNumber + 1, c: column }, e: { r: topRowNumber + 1, c: column + k.pColspan - 1 } });
      column += k.pColspan;
    });

    // Merge sum row
    mergeColRow.push({ s: { r: rows.length - 3, c: 0 }, e: { r: rows.length - 3, c: (leftHeader.length - 1) } });
    mergeColRow.push({ s: { r: rows.length - 2, c: colMiddleIdx }, e: { r: rows.length - 2, c: colMiddleIdx + (rightHeader.length - 1) } });
    mergeColRow.push({ s: { r: rows.length - 1, c: colMiddleIdx }, e: { r: rows.length - 1, c: colMiddleIdx + (rightHeader.length - 1) } });

    ws['!merges'] = mergeColRow;
    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');

    /* calculate column width */
    const max_width_1 = rows.reduce((w, r) => Math.max(w, r[0].length), 10); // cell 'Ma so'
    const max_width_2 = rows.reduce((w, r) => Math.max(w, r[1].length), 20); // cell 'Khach hang'
    const max_width_3 = rows.reduce((w, r) => Math.max(w, r[2].length), 20); // Cell 'Ngày tạo đơn'
    const max_width_4 = rows.reduce((w, r) => Math.max(w, r[3].length), 20);// Cell 'Hợp đồng',
    const max_width_5 = rows.reduce((w, r) => Math.max(w, r[4].length), 18);// Cell 'Ngày nhận dự kiến',
    const max_width_6 = rows.reduce((w, r) => Math.max(w, r[5].length), 18);// Cell 'Ngày xác nhận đơn hàng',
    const max_width_7 = rows.reduce((w, r) => Math.max(w, r[6].length), 20);// Cell 'Ngày giao hàng',
    const max_width_8 = rows.reduce((w, r) => Math.max(w, r[7].length), 15);// Cell 'Noi nhan',
    const max_width_9 = rows.reduce((w, r) => Math.max(w, r[8].length), 15);// Cell 'Noi giao',

    const wscols = [
      { wch: max_width_1 },
      { wch: max_width_2 },
      { wch: max_width_3 },
      { wch: max_width_4 },
      { wch: max_width_5 },
      { wch: max_width_6 },
      { wch: max_width_7 },
      { wch: max_width_8 },
      { wch: max_width_9 },
    ]
    productName.forEach(m => {
      wscols.push({ wch: 10 });
    });

    wscols.push({ wch: 12 });
    wscols.push({ wch: 15 });
    wscols.push({ wch: 15 });
    wscols.push({ wch: 20 });

    ws['!cols'] = wscols;

    /** START - set css style for cells */
    // Format style for cells
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r + topRowNumber; R <= range.e.r - 2; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        // Apply gerneral style for cell
        const all = XLSX.utils.encode_cell({ c: C, r: R });
        if (ws[all]) {
          ws[all].s = ExcelDetailsConfig.generalStyle;
        }

        // Style for header excel
        const row4 = XLSX.utils.encode_cell({ c: C, r: topRowNumber });
        if (ws[row4]) {
          ws[row4].s = ExcelDetailsConfig.headerStyle;
        }
      }

      // Style for cell sum of every customer
      const colX = XLSX.utils.encode_cell({ c: colMiddleIdx + 1, r: R });
      ws[colX].s = ExcelDetailsConfig.colSumStyle;
    }

    // Style for cell product quantity
    let group = 1;
    let colspanArr = this.productDataSource.map(k => k.pColspan);
    for (let r = topRowNumber; r < rows.length - 2; r++) {
      group = 1;
      column = leftHeader.length;
      colspanArr.forEach(e => {
        for (let j = column; j < (column + e); ++j) {
          const colC = XLSX.utils.encode_cell({ c: j, r: r });
          delete ws[colC].w;
          switch (group) {
            case 1:
              ws[colC].s = ExcelDetailsConfig.group1Style;
              break;
            case 2:
              ws[colC].s = ExcelDetailsConfig.group2Style;
              break;
            case 3:
              ws[colC].s = ExcelDetailsConfig.group3Style;
              break;
            case 4:
              ws[colC].s = ExcelDetailsConfig.group4Style;
              break;
          }
        }
        column += e;
        group += 1;
      });
    }

    // Style for header, footer of product
    group = 1;
    column = leftHeader.length;
    colspanArr.forEach(e => {
      for (let j = column; j < (column + e); ++j) {
        const colH1 = XLSX.utils.encode_cell({ c: j, r: (topRowNumber + 1) });
        delete ws[colH1].w;

        const colH2 = XLSX.utils.encode_cell({ c: j, r: (topRowNumber + 2) });
        delete ws[colH2].w;

        const colF = XLSX.utils.encode_cell({ c: j, r: (rows.length - 3) });
        delete ws[colF].w;
        switch (group) {
          case 1:
            ws[colH1].s = ExcelDetailsConfig.group1StyleHeader;
            ws[colH2].s = ExcelDetailsConfig.group1StyleHeader;
            ws[colF].s = ExcelDetailsConfig.group1StyleFooter;
            break;
          case 2:
            ws[colH1].s = ExcelDetailsConfig.group2StyleHeader;
            ws[colH2].s = ExcelDetailsConfig.group2StyleHeader;
            ws[colF].s = ExcelDetailsConfig.group2StyleFooter;
            break;
          case 3:
            ws[colH1].s = ExcelDetailsConfig.group3StyleHeader;
            ws[colH2].s = ExcelDetailsConfig.group3StyleHeader;
            ws[colF].s = ExcelDetailsConfig.group3StyleFooter;
            break;
          case 4:
            ws[colH1].s = ExcelDetailsConfig.group4StyleHeader;
            ws[colH2].s = ExcelDetailsConfig.group4StyleHeader;
            ws[colF].s = ExcelDetailsConfig.group4StyleFooter;
            break;
        }
      }
      column += e;
      group += 1;
    });

    // Style for header row 0
    const row0 = XLSX.utils.encode_cell({ c: colMiddleIdx, r: 1 });
    if (ws[row0]) {
      delete ws[row0].w;
      ws[row0].s = ExcelDetailsConfig.r0Style;
    }

    // Style for header row 1
    const row1 = XLSX.utils.encode_cell({ c: colMiddleIdx, r: 2 });
    if (ws[row1]) {
      delete ws[row1].w;
      ws[row1].s = ExcelDetailsConfig.r1Style;
    }

    // Style for footer row 0
    const rowf0 = XLSX.utils.encode_cell({ c: colMiddleIdx, r: rows.length - 2 });
    if (ws[rowf0]) {
      delete ws[rowf0].w;
      ws[rowf0].s = ExcelDetailsConfig.rf1Style;
    }

    // Style for footer row 1
    const rowf1 = XLSX.utils.encode_cell({ c: colMiddleIdx, r: rows.length - 1 });
    if (ws[rowf1]) {
      delete ws[rowf1].w;
      ws[rowf1].s = ExcelDetailsConfig.rf0Style;
    }

    // Style for Cell product label
    const rowPr = XLSX.utils.encode_cell({ c: leftHeader.length, r: topRowNumber });
    if (ws[rowPr]) {
      ws[rowPr].s = ExcelDetailsConfig.cellStyleProductLabel;
    }

    // Style for Cell 39 
    const row2 = XLSX.utils.encode_cell({ c: leftHeader.length, r: 3 });
    if (ws[row2]) {
      delete ws[row2].w;
      ws[row2].s = ExcelDetailsConfig.r2c9TitleStyle;
    }

    // Style for Cell 30
    const row3 = XLSX.utils.encode_cell({ c: 0, r: 3 });
    if (ws[row3]) {
      delete ws[row3].w;
      ws[row3].s = ExcelDetailsConfig.r2c0TitleStyle;
    }

    // Style for Cell sum
    const rowSum = XLSX.utils.encode_cell({ c: 0, r: rows.length - 3 });
    if (ws[rowSum]) {
      delete ws[rowSum].w;
      ws[rowSum].s = ExcelDetailsConfig.rowSumStyle;
    }

    const colFs = XLSX.utils.encode_cell({ c: colMiddleIdx + 1, r: (rows.length - 3) });
    delete ws[colFs].w;
    ws[colFs].s = ExcelDetailsConfig.styleSumFooter;
    /** END - set css style for cells */

    XLSX.writeFile(wb, this.fileNameExcel, { cellStyles: true });
  }

  replaceTextInDate(str: string) {
    return str = str.replace(":", "h").replace(" ", "' ");
  }

}
