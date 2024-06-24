import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import { Location } from '@angular/common';
import { DisplayService } from '../../services/display.service';
import { MatTableDataSource } from '@angular/material/table';
import { Cities, PRODUCT_CATEGORIES, RECEIPT } from '../../constants/const-data';
import { Product } from '../../models/product';
import { Helper } from '../../helpers/helper';
import { SearchDetailsOrder } from '../../models/search';
import { RoutesService } from '../../services/routes.service';
import { concatMap, finalize, tap } from 'rxjs';
import { SocketService } from '../../services/socket.service';

export interface ItemRow {
  no: number,
  customer: string,
  delivery: string,
  licensePlate: string,
  receipt: string,
  products: { pId: number, pValue: string }[],
  sum: string,
}

@Component({
  selector: 'app-order-slideshow',
  templateUrl: './order-slideshow.component.html',
  styleUrls: ['./order-slideshow.component.scss']
})
export class OrderSlideshowComponent implements OnInit, OnDestroy {
  private helper = new Helper();
  pickupCities: any[] = Cities;
  receipt: any[] = RECEIPT;
  receivedStatus: number = 2;
  shippedStatus: number = 4;
  displayTodate = "";
  today = "";
  tomorrow = "";

  productList: Product[] = [];
  agencyList: any[] = [];

  /** Defined column section1 */
  colDefSection1: string[] = ['no', 'customer', 'delivery', 'license_plate', 'receipt'];
  columnsRow1Section1: string[] = [...this.colDefSection1, 'products', 'sum'];
  columnsRowProductCategory: string[] = [];
  columnsDefProductName: string[] = [];
  displayedColumnsProductName: { id: number, label: string, value: string }[] = [];
  displayedColumnsSection1: string[] = [];
  columnDefRowSumSection1: string[] = [];
  displayedRowSumSection1: { label: string, value: number }[] = [];
  dataSource1 = new MatTableDataSource<any>();

  /** Defined column section2 */
  columnsRow1Section2: string[] = ['no', 'products', 'sum'];
  dataSource2 = new MatTableDataSource<any>();
  columnDefRowSumSection2: string[] = [];
  displayedColumnsSection2: string[] = ['no', 'sum'];
  columnDefRowSumFooterSection2: string[] = ['no', 'sum'];
  displayedRowSumSection2: { label: string, value: number }[] = [];

  thRowspan: number = 3;
  thColspan: number = 0;

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
    status: this.receivedStatus + "," + this.shippedStatus,
    productId: '',
    startDate: '',
    endDate: '',
    userId: 0,
  }

  responseReceived: any[] = [];
  responseShipped: any[] = [];
  loading: boolean = true;
  totalInDay: number = 0;
  columnDefRowLastedSection1: string[] = ['empty', 'footer-row-lasted-label', 'total', 'lasted'];
  colspanLasted: number = 0;

  constructor(
    public router: Router,
    private orderService: OrderService,
    public translate: TranslateService,
    private location: Location,
    private displayService: DisplayService,
    private socketService: SocketService,
    private routesService: RoutesService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.convertDate();
    this.loading = true;
    this.displayService.setNavigationVisibility(false);
    this.onRequestServer();
    this.emitSocket();
  }

  ngOnDestroy() {
    this.displayService.setNavigationVisibility(true);
  }

  onRequestServer() {
    this.routesService.getFilterList().pipe(
      tap((res) => {
        this.mappingFilterList(res);
      }),
      concatMap(() => this.routesService.getOrderDetails(this.searchForm)),
      tap((res1) => {
        this.mappingOrderDetail(res1.orders);
      }),
      finalize(() => this.loading = false)
    ).subscribe(success => {
      console.log('success');
      this.setDisplayedColumns();
      this.generalOrderDetailToTable();
    }, errorData => { console.log('error'); })
  }

  emitSocket() {
    // Listening product CRUD
    this.socketService.socketOnGetProductList().subscribe((result) => {
      this.getOrderDetailData();
    })
    // Listening order status changed
    this.socketService.socketOnOrderStatusChanged().subscribe((result) => {
      this.getOrderDetailData();
    });

    // Listening added order
    this.socketService.socketOnOrderAdded().subscribe((result) => {
      this.getOrderDetailData();
    });

    // Listening updated order
    this.socketService.socketOnOrderUpdated().subscribe((result) => {
      this.getOrderDetailData();
    });

    // listening deleted order
    this.socketService.socketOnOrderDeleted().subscribe((result) => {
      this.dataSource1.data = this.dataSource1.data.filter(x => x.id !== result.id)
      this.dataSource1.data = this.dataSource1.data;
      this.dataSource2.data = this.dataSource2.data.filter(x => x.id !== result.id)
      this.dataSource2.data = this.dataSource2.data;
    });
  }

  private getOrderDetailData() {
    this.orderService.searchDetails(this.searchForm).subscribe((response: any) => {
      this.productList = this.helper.sortAZ(response.productList, 'category');
      this.mappingOrderDetail(response.orders);
      this.setDisplayedColumns();
      this.generalOrderDetailToTable();
    });
  }

  private mappingFilterList(response: any) {
    if (response) {
      this.agencyList = response.agencyList;
      this.productList = this.helper.sortAZ(response.productList, 'category');
    }
  }

  private mappingOrderDetail(response: any) {
    if (response.length > 0) {
      let groupByResponse: any[] = this.groupByValue(response, 'status');

      if (groupByResponse[0]) {
        if (groupByResponse[0][0].status === this.receivedStatus) {
          this.responseReceived = groupByResponse[0]
        } else {
          this.responseShipped = groupByResponse[0];
        }
      }

      if (groupByResponse[1] !== undefined) {
        if (groupByResponse[1][0].status === this.shippedStatus) {
          this.responseShipped = groupByResponse[1];
        } else {
          this.responseReceived = groupByResponse[1];
        }
      }

    } else {
      this.responseReceived = [];
      this.responseShipped = [];
    }
  }

  onBack() {
    this.location.back();
  }

  private setDisplayedColumns() {
    this.columnsDefProductName = [];
    this.displayedColumnsProductName = [];
    this.columnsRowProductCategory = [];
    this.displayedColumnsSection1 = [];
    this.displayedColumnsSection2 = [];
    this.productDataSource = [];

    let sutuList: { pId: number, pCategory: number, pName: string }[] = [];
    let phutuList: { pId: number, pCategory: number, pName: string }[] = [];
    let xaList: { pId: number, pCategory: number, pName: string }[] = [];
    let khacList: { pId: number, pCategory: number, pName: string }[] = [];
    this.thColspan = this.productList.length;

    /** Replacement product name for displayed columns */
    let subProductList = this.groupByValue(this.productList, 'category');
    subProductList.forEach((e: any) => {
      switch (e[0].category) {
        case PRODUCT_CATEGORIES[0].value:
          e.forEach((x: any) => {
            sutuList.push({ pId: x.id, pCategory: x.category, pName: this.replaceProductName(x.name) });
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
            phutuList.push({ pId: x.id, pCategory: x.category, pName: this.replaceProductName(x.name) });
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
            xaList.push({ pId: x.id, pCategory: x.category, pName: this.replaceProductName(x.name) });
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
            khacList.push({ pId: x.id, pCategory: x.category, pName: this.replaceProductName(x.name) });
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
    const displayedProductList = [...sutuList, ...phutuList, ...xaList, ...khacList];
    this.columnsDefProductName = displayedProductList.map(p => p.pCategory.toString() + "." + displayedProductList.indexOf(p));
    this.displayedColumnsProductName = displayedProductList.map(p =>
    ({
      id: p.pId,
      label: p.pCategory.toString() + "." + displayedProductList.indexOf(p),
      value: p.pName
    })
    );

    /** Handle columndef for section1, section2 */
    this.displayedColumnsSection1 = [...this.colDefSection1, ...this.columnsDefProductName, 'sum']
    this.displayedColumnsSection2 = ['no', ...this.columnsDefProductName, 'sum']
  }

  private generalOrderDetailToTable() {
    let sumRow1: any[] = [];
    let sumRow2: any[] = [];
    let dataSourceObject1: ItemRow[] = [];
    let dataSourceObject2: ItemRow[] = [];
    const productTemplate = this.displayedColumnsProductName.map(x => ({ pId: x.id, pValue: "", pCategory: x.label }));

    /** GENERAL DATASOURCE INTO A CELL ON TABLE */
    /*** Mapping data cell for Section 1 */
    /**** START */
    if (this.responseReceived.length > 0) {
      this.columnDefRowSumSection1 = [];
      this.displayedRowSumSection1 = [];
      this.columnDefRowLastedSection1 = ['empty', 'footer-row-lasted-label', 'total', 'lasted'];
      this.colspanLasted = 0;

      this.responseReceived.forEach((x: any) => {
        x.agencyName = this.agencyList.find(i => i.id === x.agencyId)?.agencyName;
        let receipt = this.receipt.find(i => i.value === x.receipt);
        let products = productTemplate.map(x => ({ ...x }));
        x.products.forEach((k: any) => {
          products.map(y => {
            if (y.pId === k.id) {
              y.pValue = k.quantity;
            }
          });
        });

        dataSourceObject1.push({
          no: x.approvedNumber,
          customer: x.agencyName,
          delivery: this.compareObj(this.pickupCities, x.pickupId),
          licensePlate: x.licensePlates,
          receipt: receipt ? receipt.label : "",
          products: products,
          sum: x.productTotal.toString(),
        });

        sumRow1 = [...sumRow1, ...products];
      });

      this.dataSource1.data = dataSourceObject1;

      /** Set sum value footer of every product */
      let groupSumRowSection1 = this.groupByValue(sumRow1, 'pCategory');

      // Total sum
      let sumTotal1 = this.helper.sum(dataSourceObject1, 'sum');
      this.totalInDay = Math.round((this.totalInDay + sumTotal1) * 100000000) / 100000000;

      let sumColRow1 = productTemplate.map(x => ({ ...x }));
      groupSumRowSection1.forEach((e: any) => {
        this.columnDefRowSumSection1.push(e[0].pCategory + ".s" + groupSumRowSection1.indexOf(e));
        this.columnDefRowLastedSection1.push(e[0].pCategory + ".s" + groupSumRowSection1.indexOf(e));
        let sum = this.helper.sum(e, 'pValue');
        sumColRow1.map(y => {
          if (y.pId === e[0].pId) {
            y.pValue = sum + "";
          }
        });
      });

      sumColRow1.forEach(e => {
        this.displayedRowSumSection1.push({ label: e.pCategory + ".s" + sumColRow1.indexOf(e), value: Number(e.pValue) });
      });

      this.columnDefRowSumSection1.push("s" + (this.thColspan + 1));
      this.columnDefRowSumSection1 = ['footer-row-label', ...this.columnDefRowSumSection1];
      this.displayedRowSumSection1.push({ label: "s" + (this.thColspan + 1), value: sumTotal1 });

      // Pop 4 element
      this.columnDefRowLastedSection1 = this.columnDefRowLastedSection1.slice(0, this.columnDefRowLastedSection1.length - productTemplate.length);
      this.colspanLasted = this.columnDefRowSumSection1.length - 4;
    } else {
      this.displayedColumnRowSection1(productTemplate);
    }
    /**** END */

    /*** Mapping data cell for Section 1 */
    /**** START */
    if (this.responseShipped.length > 0) {
      this.columnDefRowSumSection2 = [];
      this.displayedRowSumSection2 = [];

      this.responseShipped.forEach((x: any) => {
        x.agencyName = this.agencyList.find(i => i.id === x.agencyId)?.agencyName;
        let receipt = this.receipt.find(i => i.value === x.receipt);
        let products = productTemplate.map(x => ({ ...x }));
        x.products.forEach((k: any) => {
          products.map(y => {
            if (y.pId === k.id) {
              y.pValue = k.quantity;
            }
          });
        });

        dataSourceObject2.push({
          no: x.approvedNumber,
          customer: x.agencyName,
          delivery: this.compareObj(this.pickupCities, x.pickupId),
          licensePlate: x.licensePlates,
          receipt: receipt ? receipt.label : "",
          products: products,
          sum: x.productTotal.toString(),
        });
        sumRow2 = [...sumRow2, ...products];
      });

      /** Set sum value footer of every product */
      let groupSumColsSection2 = this.groupByValue(sumRow2, 'pCategory');

      // Sum all of sum
      let sumTotal2 = this.helper.sum(dataSourceObject2, 'sum');
      this.totalInDay = Math.round((this.totalInDay + sumTotal2) * 100000000) / 100000000;

      this.dataSource2.data = dataSourceObject2;

      this.columnDefRowSumSection2 = ['footer-row-label', "s" + (this.thColspan + 1)];
      this.displayedRowSumSection2.push({ label: "s" + (this.thColspan + 1), value: sumTotal2 });
    } else {
      this.displayedColumnRowSection2(productTemplate);
    }
    /**** END */

    this.loading = false;
    this.cdr.detectChanges();
  }

  private displayedColumnRowSection1(productTemplate: any[]) {
    this.dataSource1.data = [];
    this.columnDefRowSumSection1 = [];
    this.columnDefRowLastedSection1 = ['empty', 'footer-row-lasted-label', 'total', 'lasted'];
    this.colspanLasted = 0;
    this.totalInDay = 0;

    productTemplate.forEach(e => {
      this.columnDefRowSumSection1.push("s" + productTemplate.indexOf(e));
      this.columnDefRowLastedSection1.push("s" + productTemplate.indexOf(e));
      this.displayedRowSumSection1.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
    });

    // Section1
    this.columnDefRowSumSection1.push("s" + (this.thColspan + 1));
    this.columnDefRowSumSection1 = ['footer-row-label', ...this.columnDefRowSumSection1];
    this.displayedRowSumSection1.push({ label: "s" + (this.thColspan + 1), value: 0 });
    // Pop 4 element
    this.columnDefRowLastedSection1 = this.columnDefRowLastedSection1.slice(0, this.columnDefRowLastedSection1.length - productTemplate.length);
    this.colspanLasted = this.columnDefRowSumSection1.length - 4;
  }

  private displayedColumnRowSection2(productTemplate: any[]) {
    this.dataSource2.data = [];
    this.columnDefRowSumSection2 = [];
    this.displayedRowSumSection2 = [];

    // Section2
    this.columnDefRowSumSection2 = ['footer-row-label', "s" + (this.thColspan + 1)];
    this.displayedRowSumSection2.push({ label: "s" + (this.thColspan + 1), value: 0 });
  }

  private convertDate() {
    let today = new Date();
    today = new Date(new Date().setHours(6, 0, 0, 0));
    let tomorrow = new Date(+new Date() + 86400000);
    tomorrow = new Date(+new Date().setHours(7, 0, 0, 0) + 86400000);
    this.today = this.helper.getDateFormat(5, today);
    this.tomorrow = this.helper.getDateFormat(5, tomorrow);
    this.searchForm.startDate = this.today;
    this.searchForm.endDate = this.tomorrow;
    this.displayTodate = `Ngày:  ${this.helper.getDateFormat(3, today)}`;

  }

  private compareObj(obj1: any[], obj2: any): string {
    return this.helper.compareObj(obj1, obj2);
  }

  private groupByValue(arr: any[], key: string) {
    return this.helper.groupByValue(arr, key);
  }

  private replaceProductName(name: string) {
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

    let _name = replacements.reduce(
      (acc, [oldStr, newStr]) => {
        return acc.replaceAll(oldStr, newStr);
      }, name);
    return _name;
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

  /** Updated product name display column when order changed */
  customTrackBy(index: any, item: any) {
    return item.label;
  }
}
