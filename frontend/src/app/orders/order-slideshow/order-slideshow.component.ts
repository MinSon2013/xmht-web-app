import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AgencyService } from '../../services/agency.service';
import { DeliveryService } from '../../services/delivery.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { Location } from '@angular/common';
import { DisplayService } from '../../services/display.service';
import { MatTableDataSource } from '@angular/material/table';
import { Cities, PHUTU, PRODUCT_CATEGORY, RECEIPT, SUTU, XA } from '../../constants/const-data';
import { Product } from '../../models/product';
import { Helper } from '../../helpers/helper';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-order-slideshow',
  templateUrl: './order-slideshow.component.html',
  styleUrls: ['./order-slideshow.component.scss']
})
export class OrderSlideshowComponent implements OnInit, OnDestroy {
  @Output()
  dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();

  private helper = new Helper();
  cities: any[] = Cities;
  receipt: any[] = RECEIPT;
  receivedStatus: number = 2;
  shippedStatus: number = 4;
  sumAll: number = 0;
  nowDate = this.helper.getDateFormat(3);
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  deliveries: any[] = [];
  productList: any[] = [];
  agencyList: any[] = [];

  /** Defined column section1 */
  colDefSection1: string[] = ['ms', 'customer', 'noigiao', 'phuongtien', 'phuongthucnhan'];
  columnsRow1Section1: string[] = [...this.colDefSection1, 'sanpham', 'tong'];
  columnsRowProductCategory: string[] = [];
  columnsRowProductName: string[] = [];
  displayedColumnsProductName: { id: number, label: string, value: string }[] = [];
  displayedColumnsSection1: string[] = [];
  columnDefRowSumSection1: string[] = [];
  displayedRowSumSection1: { label: string, value: number }[] = [];
  dataSource1 = new MatTableDataSource<any>();

  /** Defined column section2 */
  columnsRow1Section2: string[] = ['ms', 'sanpham', 'tong'];
  displayedColumnsSection2: string[] = [];
  dataSource2 = new MatTableDataSource<any>();
  columnDefRowSumSection2: string[] = [];
  displayedRowSumSection2: { label: string, value: number }[] = [];

  thRowspan: number = 3;
  thColspan: number = 0;

  productListResponse: Product[] = [];
  productDataSource: {
    categoryLabel: string,
    displayedCategory: string,
    pColspan: number,
    productList: { pId: number, pLabel: string, pName: string }[],
  }[] = [];

  pColspan1: number = 0;
  pColspan2: number = 0;
  pColspan3: number = 0;

  searchForm: any = {
    orderId: 0,
    agencyId: 0,
    productId: 0,
    status: 0,
    startDate: '',
    endDate: ''
  }

  constructor(
    public router: Router,
    private orderService: OrderService,
    public translate: TranslateService,
    private deliveryService: DeliveryService,
    private agencyService: AgencyService,
    private productService: ProductService,
    private location: Location,
    private displayService: DisplayService,
  ) {
    this.getAgencys();
    this.getProducts();
    this.getDelivery();
  }

  ngOnInit() {
    this.displayService.setNavigationVisibility(false);
    this.getProductData();
  }

  ngOnDestroy() {
    this.displayService.setNavigationVisibility(true);
  }

  onBack() {
    this.location.back();
  }

  getAgencys() {
    this.agencyService.getAgencyList().subscribe((response: any) => {
      this.agencyList = response;
    });
  }

  getProducts() {
    this.productService.getProductList().subscribe((response: any) => {
      this.productList = response;
    });
  }

  getDelivery() {
    this.deliveryService.getDeliveryList().subscribe((response: any) => {
      this.deliveries = response;
    });
  }

  private getProductData() {
    this.productService.getProductList().subscribe((response: any) => {
      if (response.length > 0) {
        this.productListResponse = response.reverse();
      } else {
        this.productListResponse = [];
      }
      this.setDisplayedColumns();
      this.setDataSourceSection(this.receivedStatus);
      this.setDataSourceSection(this.shippedStatus);
    });
  }

  onDateChange(): void {
    this.dateChange.emit();
    this.columnDefRowSumSection1 = [];
    this.displayedRowSumSection1 = [];
    this.columnDefRowSumSection2 = [];
    this.displayedRowSumSection2 = [];
    this.setDataSourceSection(this.receivedStatus);
    this.setDataSourceSection(this.shippedStatus);
  }

  private setDisplayedColumns() {
    const CATEGORY = PRODUCT_CATEGORY;
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

    let sutuList: { pId: number, pLabel: string, pName: string }[] = [];
    let phutuList: { pId: number, pLabel: string, pName: string }[] = [];
    let xaList: { pId: number, pLabel: string, pName: string }[] = [];

    /** Handled product name to display by category */
    this.productListResponse.forEach(element => {
      const k = CATEGORY.find(x =>
        element.name.toLocaleLowerCase().includes(x.colValue1.toLocaleLowerCase())
        || element.name.toLocaleLowerCase().includes(x.colValue2.toLocaleLowerCase()));

      if (k) {
        let productName = replacements.reduce((acc, [oldStr, newStr]) => {
          return acc.replaceAll(oldStr, newStr);
        }, element.name);

        switch (k.colDef) {
          case SUTU:
            sutuList.push({ pId: element.id, pLabel: k.colDef, pName: productName });
            break;
          case PHUTU:
            phutuList.push({ pId: element.id, pLabel: k.colDef, pName: productName });
            break;
          case XA:
            xaList.push({ pId: element.id, pLabel: k.colDef, pName: productName });
            break;
        }
      }
    });

    /** Handled product category to display  */
    /** Category 1 */
    this.productDataSource.push({
      displayedCategory: CATEGORY[0].colValue1,
      categoryLabel: SUTU,
      productList: sutuList.reverse(),
      pColspan: sutuList.length,
    });
    this.pColspan1 = sutuList.length;
    this.columnsRowProductCategory.push(CATEGORY[0].colDef);

    /** Category 2 */
    this.productDataSource.push({
      displayedCategory: CATEGORY[1].colValue1,
      categoryLabel: PHUTU,
      productList: phutuList.reverse(),
      pColspan: phutuList.length,
    });
    this.pColspan2 = phutuList.length;
    this.columnsRowProductCategory.push(CATEGORY[1].colDef);

    /** Category 3 */
    this.productDataSource.push({
      displayedCategory: CATEGORY[2].colValue1,
      categoryLabel: XA,
      productList: xaList.reverse(),
      pColspan: xaList.length,
    });
    this.pColspan3 = xaList.length;
    this.columnsRowProductCategory.push(CATEGORY[2].colDef);

    this.thColspan = this.productListResponse.length;

    /** Displayed column product name  */
    const arrProduct = [...sutuList, ...phutuList, ...xaList];
    this.columnsRowProductName = arrProduct.map(p => p.pLabel + arrProduct.indexOf(p));
    this.displayedColumnsProductName = arrProduct.map(p =>
    ({
      id: p.pId,
      label: p.pLabel + arrProduct.indexOf(p),
      value: p.pName
    })
    );

    /** Handle columndef for section1, section2 */
    this.displayedColumnsSection1 = [...this.colDefSection1, ...this.columnsRowProductName, 'tong']
    this.displayedColumnsSection2 = ['ms', ...this.columnsRowProductName, 'tong']
  }

  private setDataSourceSection(status: number) {
    // this.searchForm.startDate = this.range.value.start !== null ? this.helper.getDateFormat(3, this.range.value.start) : this.nowDate;
    // this.searchForm.endDate = this.range.value.end !== null ? this.helper.getDateFormat(3, this.range.value.end) : this.nowDate;
    let sumCols: any[] = [];
    let dataSourceObject: {
      ms: number,
      customer: string,
      noigiao: string,
      phuongtien: string,
      phuongthucnhan: string,
      sanpham: { pId: number, pValue: string }[],
      tong: string,
    }[] = [];

    this.searchForm.status = status;
    const productTemplate = this.displayedColumnsProductName.map(x => ({ pId: x.id, pValue: "" }));
    this.orderService.search(this.searchForm).subscribe((response: any) => {
      if (response.length > 0) {


        if (status === this.shippedStatus) {
          response = response.slice(0, 30)
          console.log(response)

        }



        response.forEach((x: any) => {
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

          dataSourceObject.push({
            ms: x.approvedNumber,
            customer: x.agencyName,
            noigiao: this.compareObj(this.cities, x.pickupId),
            phuongtien: x.licensePlates,
            phuongthucnhan: receipt ? receipt.label : "",
            sanpham: products,
            tong: x.productTotal.toString(),
          });
          sumCols = [...sumCols, ...products];
        });

        /** Set sum cols of every product */
        /** Set value for footer */
        let subSumCols = this.groupByValue(sumCols, 'pId');
        this.sumAll = this.helper.sum(dataSourceObject, 'tong');
        if (status === this.receivedStatus) {
          this.dataSource1.data = dataSourceObject;
          let sumColRow = productTemplate.map(x => ({ ...x }));

          subSumCols.forEach((e: any) => {
            this.columnDefRowSumSection1.push("s" + subSumCols.indexOf(e));
            let sum = this.helper.sum(e, 'pValue');
            sumColRow.map(y => {
              if (y.pId === e[0].pId) {
                y.pValue = sum + "";
              }
            });
          });

          sumColRow.forEach(e => {
            this.displayedRowSumSection1.push({ label: "s" + sumColRow.indexOf(e), value: Number(e.pValue) });
          });

          this.columnDefRowSumSection1.push("s" + (this.thColspan + 1));
          this.columnDefRowSumSection1 = ['footer-row-label', ...this.columnDefRowSumSection1];
          this.displayedRowSumSection1.push({ label: "s" + (this.thColspan + 1), value: this.sumAll });
        } else {
          this.dataSource2.data = dataSourceObject;
          let sumColRow = productTemplate.map(x => ({ ...x }));

          subSumCols.forEach((e: any) => {
            this.columnDefRowSumSection2.push("s" + subSumCols.indexOf(e));
            let sum = this.helper.sum(e, 'pValue');
            sumColRow.map(y => {
              if (y.pId === e[0].pId) {
                y.pValue = sum + "";
              }
            });
          });
          sumColRow.forEach(e => {
            this.displayedRowSumSection2.push({ label: "s" + sumColRow.indexOf(e), value: Number(e.pValue) });
          });
          this.columnDefRowSumSection2.push("s" + (this.thColspan + 1));
          this.columnDefRowSumSection2 = ['footer-row-label', ...this.columnDefRowSumSection2];
          this.displayedRowSumSection2.push({ label: "s" + (this.thColspan + 1), value: this.sumAll });
        }
      } else {
        this.sumAll = 0;
        if (status === this.receivedStatus) {
          this.dataSource1.data = [];
          productTemplate.forEach(e => {
            this.columnDefRowSumSection1.push("s" + productTemplate.indexOf(e));
            this.displayedRowSumSection1.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
          });
          this.columnDefRowSumSection1.push("s" + (this.thColspan + 1));
          this.columnDefRowSumSection1 = ['footer-row-label', ...this.columnDefRowSumSection1];
          this.displayedRowSumSection1.push({ label: "s" + (this.thColspan + 1), value: this.sumAll });
        } else {
          this.dataSource2.data = [];
          productTemplate.forEach(e => {
            this.columnDefRowSumSection2.push("s" + productTemplate.indexOf(e));
            this.displayedRowSumSection2.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
          });
          this.columnDefRowSumSection2.push("s" + (this.thColspan + 1));
          this.columnDefRowSumSection2 = ['footer-row-label', ...this.columnDefRowSumSection2];
          this.displayedRowSumSection2.push({ label: "s" + (this.thColspan + 1), value: this.sumAll });
        }
      }
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

  getClass(col: any) {
    let ind = this.pColspan1 + this.pColspan2 + this.pColspan3;
    console.log(col)
    if (1 < this.pColspan1) {
      return "text-flowerblue";
    } else if (1 < (this.pColspan1 + this.pColspan2)) {
      return "text-red";
    } else if (1 < (this.pColspan1 + this.pColspan2 + this.pColspan3)) {
      return "text-green";
    } else {
      return "";
    }
  }

}
