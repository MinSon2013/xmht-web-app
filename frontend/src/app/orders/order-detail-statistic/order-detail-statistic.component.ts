import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import { MatTableDataSource } from '@angular/material/table';
import { AGENCY_ROLE, Cities, PRODUCT_CATEGORIES, RECEIPT } from '../../constants/const-data';
import { Product } from '../../models/product';
import { Helper } from '../../helpers/helper';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchDetailsOrder } from '../../models/search';

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

  cities: any[] = Cities;
  receipt: any[] = RECEIPT;
  deliveries: any[] = [];
  productList: Product[] = [];
  customerList: any[] = [];
  driverList: any[] = [];
  licensePlateList: any[] = [];

  customerSelected = null;
  receivedAdressSelected = null;
  receiptSelected = null;
  productSelected = null;
  driverSelected = null;
  licensePlateSelected = null;

  /** Defined column section1 */
  colDefSection: string[] = ['no', 'customer', 'createDate', 'contract', 'receivedDate', 'confirmDate', 'shippingDate', 'pickupAddress', 'delivery'];
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
    delivery: string,
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
    agencyId: 0,
    deliveryId: "",
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

  constructor(
    public router: Router,
    private orderService: OrderService,
    public translate: TranslateService,
  ) {
  }

  ngOnDestroy(): void {
  }

  ngOnInit() {
    this.getFilterList();

    const dFormat = this.helper.getDateFormat(3);
    const m = dFormat.split('/');
    this.nowDay = `..........., ngày ${m[0]} tháng ${m[1]} năm ${m[2]}`;
  }

  onShow() {
    this.progressLoading = true;
    this.getDataSource();
  }

  emitSocket() {
    ///////////////
  }

  getFilterList() {
    this.orderService.getFilterList().subscribe((response: any) => {
      if (response) {
        this.customerList = response.agencyList;
        this.productList = response.productList;
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
        this.getDataSource();/////////////
      }
    });
  }

  getDataSource() {
    this.setDisplayedColumns();
    this.setDataSourceSection();
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

  dateRangeChange(): void {
    this.range.get('end')?.valueChanges.subscribe((endDate: any) => {
      this.columnDefRowSumSection = [];
      this.displayedRowSumSection = [];
      this.setDataSourceSection();
    })
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
      productList: sutuList.reverse(),
      pColspan: sutuList.length,
    });

    /** Category Phu tu */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[1].label,
      categoryValue: PRODUCT_CATEGORIES[1].value.toString(),
      productList: phutuList.reverse(),
      pColspan: phutuList.length,
    });

    /** Category Xa */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[2].label,
      categoryValue: PRODUCT_CATEGORIES[2].value.toString(),
      productList: xaList.reverse(),
      pColspan: xaList.length,
    });

    /** Category Khac */
    this.productDataSource.push({
      displayedCategory: PRODUCT_CATEGORIES[3].label,
      categoryValue: PRODUCT_CATEGORIES[3].value.toString(),
      productList: khacList.reverse(),
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
    this.displayedColumnsSection = [...this.colDefSection, ...this.columnsRowProductName, 'receipt', 'sum', 'license_plate', 'driver']
  }

  private setDataSourceSection() {
    this.searchForm.startDate = this.range.value.start !== null ? this.helper.getDateFormat(3, this.range.value.start) : "";
    this.searchForm.endDate = this.range.value.end !== null ? this.helper.getDateFormat(3, this.range.value.end) : "";
    let sumCol: any[] = [];

    const productTemplate = this.displayedColumnsProductName.map(x => ({ pId: x.id, pValue: "", pCategory: x.label }));
    this.orderService.searchDetails(this.searchForm).subscribe((response: any) => {
      if (response.length > 0) {
        /** Mapping data cell for Section 1 */
        /*** Hanled datasource for display on a cell */
        response.reverse().slice(0, 10).forEach((x: any) => {
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
            customer: x.agencyName,
            delivery: this.compareObj(this.cities, x.pickupId),
            licensePlate: x.licensePlates,
            receipt: receipt ? receipt.label : "",
            products: products,
            sum: x.productTotal.toString(),
            createdDate: x.createdDate,
            contract: x.contract.trim(),
            receivedDate: x.receivedDate,
            confirmedDate: x.confirmedDate,
            shippingDate: x.shippingDate,
            pickupAddress: Cities.find(k => k.id === x.pickupId)!.label,
            driver: x.driver.trim(),
          });
          sumCol = [...sumCol, ...products];
        });

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
        let sumAll = 0;
        this.dataSource.data = [];
        productTemplate.forEach(e => {
          this.columnDefRowSumSection.push(e.pCategory + ".s" + productTemplate.indexOf(e));
          this.displayedRowSumSection.push({ label: "s" + productTemplate.indexOf(e), value: 0 });
        });

        this.columnDefRowSumSection.push("s" + (this.thColspan + 1));
        this.columnDefRowSumSection.push("s" + (this.thColspan + 2));
        this.columnDefRowSumSection = ['footer-row-label', ...this.columnDefRowSumSection];
        this.displayedRowSumSection.push({ label: "s" + (this.thColspan + 1), value: 0 });
        this.displayedRowSumSection.push({ label: "s" + (this.thColspan + 1), value: sumAll });
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

  onExportExcel() {

  }

}
