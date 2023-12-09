import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Cities } from '../../constants/const-data';
import { Helper } from '../../helpers/helper';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgxPrintElementService } from 'ngx-print-element';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import {Location} from '@angular/common';
import { NumToVietnameseText } from '../../common/num-to-vietnamese-text';
import * as moment from 'moment';

@Component({
  selector: 'app-print-pdf',
  templateUrl: './print-pdf.component.html',
  styleUrls: ['./print-pdf.component.scss']
})
export class PrintPdfComponent implements OnInit {
  @ViewChild('pdfTable') pdfTable!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['no', 'category', 'ton', 'amount', 'note'];
  dataSource = new MatTableDataSource<any>();
  columnsToDisplay = this.displayedColumns.slice();

  helper = new Helper();
  cities: any[] = Cities;
  deliveries: any[] = this.helper.getDeliveryList();
  agencyList = this.helper.getAgencyList();

  header: string = '';
  agency: string = '';
  data: any;
  hidden: boolean = true;
  config = {};

  confirmedDate: string = '';
  shippingDate: string = `Xuất xong lúc:........., ngày........tháng........năm..........`;
  driver: string = '';
  licensePlates: string = '';
  productTotal: string = '';
  spans: any = [];
  numberToText: string = '';
  numToText = new NumToVietnameseText();

  constructor(public dialog: MatDialog,
    public router: Router,
    private route: ActivatedRoute,
    public print: NgxPrintElementService,
    public translate: TranslateService,
    private orderService: OrderService,
    private location: Location,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.data = navigation?.extras;
  }

  ngOnInit(): void {
    if (!this.data.agencyId) {
      this.location.back();
    } else {
      this.agency = this.agencyList.find(y => y.id === this.data.agencyId)!.fullName;
      this.translate.get('TITLE_APP').subscribe(x => {
        this.header = x;
      });
      this.config = {
        printMode: 'template-popup',
        popupProperties: 'toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,fullscreen=yes',
        pageTitle: 'Chi tiết đơn hàng',
        templateString: `<header></header><br/>{{printBody}}<footer></footer>`,
        stylesheets: [{ rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' }],
        styles: [
          'img { max-width: 10rem; }',
          'td { border: 1px solid grey; color: black; grey; font-size: 16pt;height: 27pt;}',
          'th { border: 1px solid grey; font-size: 15pt; width:5%}',
          'table { border: 1px solid grey; color: black; margin-left: 0rem; width: 98%;}',
          '.header, table, footer { margin: auto; text-align: center; width: 98%;}',
          '.header {padding-bottom: 1rem;}',
          '@media print{@page {size: landscape; top: 1rem; margin: 0px !important;}}',
          '.nowrap { white-space: pre !important;}',
          '.container {width: 80%; min-width: 80%; font-family: Times New Roman, Times, serif;}',
          'html {margin-left: 1.5rem; padding: 0rem;}',
          '.left {text-align: left; padding-left: 2px;}',
          'header {margin: 0.5rem}',
          '.s {margin-left: 5px; font-weight: 600; font-size: 14pt; }',
          '.fw {font-weight: 600; font-size: 14pt; text-align: center;}',
          '.label {font-size: 15pt;}',
          '.align-left { text-align: left; padding-left: 20px;}',
          '.fw-600 { font-weight: 600; }',
          '.left-1 {margin-left: 0rem;}',
          '.logo {margin: 0 6rem;}',
          '.top {margin-top: 1rem;}',
          '.cd {margin-right: 1.5rem; font-size: 15pt; font-weight: 600;}',
          '.sd {margin-right: 1.5rem; font-size: 14pt;}',
          '.w-0 {width: 0%}',
        ]
      }
      this.getData();
    }
  }

  getData() {
    this.orderService.getOrderList().subscribe((response: any) => {
      if (response.length > 0) {
        const orderList = response;
        const order = orderList.find((x: any) => x.id === this.data.id);

        if (order.confirmedDate.length > 0) {
          const k = order.confirmedDate.split(' ');
          const m = k[1].split('/');
          this.confirmedDate = `Mã số: ${order.approvedNumber}, ngày ${m[0]} tháng ${m[1]} năm ${m[2]}`;
        } else {
          this.confirmedDate = `Mã số: ${order.approvedNumber}, ngày .... tháng ..... năm .....`;
        }
        this.driver = order.driver;
        this.licensePlates = order.licensePlates;
        this.productTotal = order.productTotal;
        this.numberToText = this.numToText.toVietnamese(this.productTotal) + this.numToText.convertDecimal(this.productTotal, 'tấn');

        if (order.shippingDate.length > 0) {
          const ks = order.shippingDate.split(' ');
          const ms = ks[1].split('/');
          ks[0] = moment().format('HH giờ mm"');
          this.shippingDate = `Xuất xong lúc: ${ks[0]}, ngày ${ms[0]} tháng ${ms[1]} năm ${ms[2]}`;
        }

        const arrays: any[] = [];
        let data: {no: string, category: string, amount: string, note: string, ton: string} = {
          no: '',
          category: '',
          amount: '',
          note: '',
          ton: 'Tấn',
        }
        const _data = data;
        let idx = 0;
        order.products.forEach((x: { id: number; name: string; quantity: number; }) => {
          idx = idx + 1;
          data = {no: idx + '', category: x.name, amount: x.quantity.toString(), note: order.note, ton: 'Tấn'};
          //data = {no: x.id.toString(), category: x.name, amount: x.quantity.toString(), note: order.note, ton: 'Tấn'};
          arrays.push(data);
        });
        arrays.sort((a, b) => {
          return a.no-b.no;
          });
        this.dataSource.data = arrays;
        this.cacheSpan(arrays, 'ton', (d: { ton: any; }) => d.ton);
        this.cacheSpan(arrays, 'note', (d: { ton: any; }) => d.ton);
      } else {
        this.dataSource.data = [];
        this.cacheSpan([], 'ton', (d: { ton: any; }) => d.ton);
        this.cacheSpan([], 'note', (d: { ton: any; }) => d.ton);
      }
    });
  }

  compareObj(obj1: any[], obj2: any): string {
    const obj = obj1.find(x => x.id === obj2);
    if (obj) {
      return obj.label;
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['orders/list']);
  }

  getRowSpan(col: string, index: number) {
    return this.spans[index] && this.spans[index][col];
  }

  cacheSpan(data: any, key: string, accessor: any) {
    for (let i = 0; i < data.length;) {
      let currentValue = accessor(data[i]);
      let count = 1;

      // Iterate through the remaining rows to see how many match
      // the current value as retrieved through the accessor.
      for (let j = i + 1; j < data.length; j++) {        
        if (currentValue !== accessor(data[j])) {
          break;
        }

        count++;
      } 

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // Store the number of similar values that were found (the span)
      // and skip i to the next unique row.
      this.spans[i][key] = count;
      i += count;
    }
  }

  onPrint() {
    const element = new ElementRef('pdfTable');
    this.print.print(element, { ...this.config, printMode: 'template' });
  }

}
