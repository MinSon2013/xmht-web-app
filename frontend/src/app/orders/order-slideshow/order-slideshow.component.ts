import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import { Location } from '@angular/common';
import { DisplayService } from '../../services/display.service';
import { MatTableDataSource } from '@angular/material/table';
import { Cities, PRODUCT_CATEGORIES, RECEIPT } from '../../constants/const-data';
import { Product } from '../../models/product';
import { Helper } from '../../helpers/helper';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchDetailsOrder } from '../../models/search';
import { CustomSocket } from '../../sockets/custom-socket';
import { ProductService } from '../../services/product.service';

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
  nowDate = this.helper.getDateFormat(3);
  range = new FormGroup({
    start: new FormControl<Date | null>(new Date()),
    end: new FormControl<Date | null>(new Date()),
  });

  productList: Product[] = [];
  agencyList: any[] = [];

  /** Defined column section1 */
  colDefSection1: string[] = ['no', 'customer', 'delivery', 'license_plate', 'receipt'];
  columnsRow1Section1: string[] = [...this.colDefSection1, 'products', 'sum'];
  columnsRowProductCategory: string[] = [];
  columnsRowProductName: string[] = [];
  displayedColumnsProductName: { id: number, label: string, value: string }[] = [];
  displayedColumnsSection1: string[] = [];
  columnDefRowSumSection1: string[] = [];
  displayedRowSumSection1: { label: string, value: number }[] = [];
  dataSource1 = new MatTableDataSource<any>();

  /** Defined column section2 */
  columnsRow1Section2: string[] = ['no', 'products', 'sum'];
  displayedColumnsSection2: string[] = [];
  dataSource2 = new MatTableDataSource<any>();
  columnDefRowSumSection2: string[] = [];
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

  loading: boolean = true;

  constructor(
    public router: Router,
    private orderService: OrderService,
    public translate: TranslateService,
    private location: Location,
    private displayService: DisplayService,
    private socket: CustomSocket,
    private productService: ProductService,
  ) {
  }

  ngOnInit() {
    this.displayService.setNavigationVisibility(false);
    this.getFilterList();
    this.emitSocket();
  }

  emitSocket() {
    this.socket.on('emitGetProductList', (response: Product[]) => {
      this.getProductList();
    })
    this.socket.on('emitGetOrderList', (response: Product[]) => {
      this.setDataSourceSection();
    })
    this.socket.on('statusOrderChanged', (response: Product[]) => {
      this.setDataSourceSection();
    })
  }

  getProductList() {
    this.productService.getProductList().subscribe((response: any) => {
      if (response.length > 0) {
        this.productList = response;
        this.productList.sort((a, b) => (a.category < b.category ? -1 : 1));
      } else {
        this.productList = [];
      }
    });
  }

  ngOnDestroy() {
    this.displayService.setNavigationVisibility(true);
  }

  onBack() {
    this.location.back();
  }

  getFilterList() {
    this.orderService.getFilterList().subscribe((response: any) => {
      if (response) {
        this.agencyList = response.agencyList;
        this.productList = response.productList;
        this.setDisplayedColumns();
        this.setDataSourceSection();
      }
    });
  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    if (dateRangeEnd.value) {
      this.loading = true;
      this.setDataSourceSection();
    }
  }

  private setDisplayedColumns() {
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
          break;
        case PRODUCT_CATEGORIES[1].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            phutuList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          break;
        case PRODUCT_CATEGORIES[2].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            xaList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          break;
        case PRODUCT_CATEGORIES[3].value:
          e.forEach((x: any) => {
            let productNameReplacement = replacements.reduce(
              (acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
              }, x.name);
            khacList.push({ pId: x.id, pCategory: x.category, pName: productNameReplacement });
          });
          break;
      }
    });

    /** Handled product category to display  */
    /** Category Su tu */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[0].label,
      categoryValue: PRODUCT_CATEGORIES[0].value.toString(),
      productList: sutuList,
      pColspan: sutuList.length,
    });

    /** Category Phu tu */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[1].label,
      categoryValue: PRODUCT_CATEGORIES[1].value.toString(),
      productList: phutuList,
      pColspan: phutuList.length,
    });

    /** Category Xa */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[2].label,
      categoryValue: PRODUCT_CATEGORIES[2].value.toString(),
      productList: xaList,
      pColspan: xaList.length,
    });

    /** Category Khac */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[3].label,
      categoryValue: PRODUCT_CATEGORIES[3].value.toString(),
      productList: khacList,
      pColspan: khacList.length,
    });

    /** Set displayed columns product categories */
    this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[0].value.toString());
    this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[1].value.toString());
    this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[2].value.toString());
    this.columnsRowProductCategory.push(PRODUCT_CATEGORIES[3].value.toString());

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

    /** Handle columndef for section1, section2 */
    this.displayedColumnsSection1 = [...this.colDefSection1, ...this.columnsRowProductName, 'sum']
    this.displayedColumnsSection2 = ['no', ...this.columnsRowProductName, 'sum']
  }

  private setDataSourceSection() {
    this.searchForm.startDate = this.range.value.start !== null ? this.helper.getDateFormat(3, this.range.value.start) : this.nowDate;
    this.searchForm.endDate = this.range.value.end !== null ? this.helper.getDateFormat(3, this.range.value.end) : this.nowDate;
    let sumCols1: any[] = [];
    let sumCols2: any[] = [];
    let dataSourceObject1: {
      no: number,
      customer: string,
      delivery: string,
      licensePlate: string,
      receipt: string,
      products: { pId: number, pValue: string }[],
      sum: string,
    }[] = [];
    let dataSourceObject2: {
      no: number,
      customer: string,
      delivery: string,
      licensePlate: string,
      receipt: string,
      products: { pId: number, pValue: string }[],
      sum: string,
    }[] = [];

    let responseReceived: any[] = [];
    let responseShipped: any[] = [];

    const productTemplate = this.displayedColumnsProductName.map(x => ({ pId: x.id, pValue: "", pCategory: x.label }));

    this.orderService.searchDetails(this.searchForm).subscribe((response: any) => {
      if (response.length > 0) {
        let groupByResponse: any[] = this.groupByValue(response, 'status');
        if (groupByResponse.length > 0 && groupByResponse[0] !== undefined) {
          if (groupByResponse[0][0].status === this.receivedStatus) {
            responseReceived = groupByResponse[0]
          } else {
            responseShipped = groupByResponse[0];
          }
        }
        if (groupByResponse.length > 0 && groupByResponse[1] !== undefined) {
          if (groupByResponse[1][0].status === this.shippedStatus) {
            responseShipped = groupByResponse[1];
          } else {
            responseReceived = groupByResponse[1];
          }
        }


        /** Mapping data cell for Section 1 */
        /** START */
        /*** Hanled datasource for display on a cell */
        if (responseReceived.length > 0) {
          responseReceived.forEach((x: any) => {
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
            sumCols1 = [...sumCols1, ...products];
          });

          this.columnDefRowSumSection1 = [];
          this.displayedRowSumSection1 = [];

          /** Set sum value footẻ of every product */
          let subSumColsSection1 = this.groupByValue(sumCols1, 'pCategory');
          // Sum all of sum
          let sumAll1 = this.helper.sum(dataSourceObject1, 'sum');

          this.dataSource1.data = dataSourceObject1;
          let sumColRow1 = productTemplate.map(x => ({ ...x }));
          subSumColsSection1.forEach((e: any) => {
            this.columnDefRowSumSection1.push(e[0].pCategory + ".s" + subSumColsSection1.indexOf(e));
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
          this.displayedRowSumSection1.push({ label: "s" + (this.thColspan + 1), value: sumAll1 });
        } else {
          this.displayedColumnRowSection1(productTemplate);
        }
        /** END */

        /** Mapping data cell for Section 1 */
        /** START */
        /***Hanled datasource for display on a cell */
        if (responseShipped.length > 0) {
          responseShipped.forEach((x: any) => {
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
            sumCols2 = [...sumCols2, ...products];
          });

          this.columnDefRowSumSection2 = [];
          this.displayedRowSumSection2 = [];

          /** Set sum cols of every product */
          /** Set value for footer */
          let subSumColsSection2 = this.groupByValue(sumCols2, 'pCategory');
          // Sum all of sum
          let sumAll2 = this.helper.sum(dataSourceObject2, 'sum');

          this.dataSource2.data = dataSourceObject2;
          let sumColRow2 = productTemplate.map(x => ({ ...x }));

          subSumColsSection2.forEach((e: any) => {
            this.columnDefRowSumSection2.push(e[0].pCategory + ".s" + subSumColsSection2.indexOf(e));
            let sum = this.helper.sum(e, 'pValue');
            sumColRow2.map(y => {
              if (y.pId === e[0].pId) {
                y.pValue = sum + "";
              }
            });
          });
          sumColRow2.forEach(e => {
            this.displayedRowSumSection2.push({ label: e.pCategory + ".s" + sumColRow2.indexOf(e), value: Number(e.pValue) });
          });
          this.columnDefRowSumSection2.push("s" + (this.thColspan + 1));
          this.columnDefRowSumSection2 = ['footer-row-label', ...this.columnDefRowSumSection2];
          this.displayedRowSumSection2.push({ label: "s" + (this.thColspan + 1), value: sumAll2 });
        } else {
          this.displayedColumnRowSection2(productTemplate);
        }
        /** END */
      } else {
        this.displayedColumnRowSection1(productTemplate);
        this.displayedColumnRowSection2(productTemplate);
      }

      this.loading = false;
    });
  }

  private displayedColumnRowSection1(productTemplate: any[]) {
    this.dataSource1.data = [];
    this.columnDefRowSumSection1 = [];
    this.displayedRowSumSection1 = [];

    productTemplate.forEach(e => {
      this.columnDefRowSumSection1.push("s" + productTemplate.indexOf(e));
      this.displayedRowSumSection1.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
    });

    // Section1
    this.columnDefRowSumSection1.push("s" + (this.thColspan + 1));
    this.columnDefRowSumSection1 = ['footer-row-label', ...this.columnDefRowSumSection1];
    this.displayedRowSumSection1.push({ label: "s" + (this.thColspan + 1), value: 0 });
  }

  private displayedColumnRowSection2(productTemplate: any[]) {
    this.dataSource2.data = [];
    this.columnDefRowSumSection2 = [];
    this.displayedRowSumSection2 = [];

    productTemplate.forEach(e => {
      this.columnDefRowSumSection2.push("s" + productTemplate.indexOf(e));
      this.displayedRowSumSection2.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
    });

    // Section2
    this.columnDefRowSumSection2.push("s" + (this.thColspan + 1));
    this.columnDefRowSumSection2 = ['footer-row-label', ...this.columnDefRowSumSection2];
    this.displayedRowSumSection2.push({ label: "s" + (this.thColspan + 1), value: 0 });
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

}
