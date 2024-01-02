import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Helper } from '../helpers/helper';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { OrderService } from '../services/order.service';
import { FormControl } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { STATUS, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import * as moment from 'moment';
import { AgencyService } from '../services/agency.service';

export interface Label { }
export interface ChartDataSets {
  data: any[];
  label: string;
  barThickness: number,
  barPercentage: number,
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  [x: string]: any;
  helper: Helper = new Helper();
  orderList: any[] = [];
  productList: any[] = [];
  date = new FormControl(new Date());
  month: number = 0;
  year: number = 0;

  // Bar chart
  public barChartOptions: ChartOptions = {
    responsive: false,

  };
  public barChartLabels: Label[] = [];
  public barChartType: string = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartDataSets[] = [];

  // Pie chart
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        }
      },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['violet', 'Yellow', 'indigo', 'Pink', 'Green', 'Orange', 'Blue', 'Grey', 'red']
    }]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];

  searchForm: any = {
    approvedNumber: 0,
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

  agencySelected: any = null;
  productSelected: any = null;
  selectedStatus: any = null;
  status: any[] = STATUS;
  isAdmin: boolean = this.helper.isAdmin();
  role: number = this.helper.getUserRole();
  isStocker: boolean = this.role === STOCKER_ROLE;
  hidden: boolean = this.role === USER_AREA_MANAGER_ROLE || this.isStocker;
  isUserRole: boolean = this.helper.getRoleAllowed(4).includes(this.role);
  isAllRole: boolean = this.isUserRole || this.isAdmin;
  agencyList: any[] = [];

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private agencyService: AgencyService,
  ) {
    this.getProducts();
    this.getAgencys();
  }

  ngOnInit() {
    this.getDataChartPie();
    this.getDataChartByDate();
  }

  getProducts() {
    this.productService.getProductList().subscribe((response: any) => {
      this.productList = response;
    });
  }

  getAgencys() {
    this.agencyService.getAgencyList().subscribe((response: any) => {
      this.agencyList = response;
    });
  }

  generateBarChart() {
    let labels: any[] = [];
    this.orderList.forEach(x => {
      const k = x.createdDate.split(' ');
      if (k.length < 2) {
        const m = k[0].split('/');
        labels.push({ label: (`${m[1]}/${m[2]}`).toString() });
      } else {
        const m = k[1].split('/');
        labels.push({ label: (`${m[1]}/${m[2]}`).toString() });
      }
    });

    let labelList = this.count(labels);
    let dt: any[] = [];
    let lb: any[] = [];
    labelList.forEach((x: any) => {
      lb.push(x.label);
      dt.push(x.count);
    });

    setTimeout(() => {
      this.barChartLabels = lb;
      this.barChartData = [{ data: dt, label: 'Đơn hàng', barThickness: 80, barPercentage: 1, }];
    }, 500);
  }

  count(list: any[]) {
    const convert = (list: any[]) => {
      const res: any = {};
      list.forEach((obj: any) => {
        const key = `${obj.label}`;
        if (!res[key]) {
          res[key] = { ...obj, count: 0 };
        };
        res[key].count += 1;
      });
      return Object.values(res);
    };
    return convert(list);
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  public chartClicked(event: any): void { }

  public chartHovered(event: any): void { }

  getDataChartByDate() {
    this.orderService.search(this.searchForm).subscribe((response: any) => {
      this.orderList = response;
      this.generateBarChart();
    });
  }

  getDataChartPie() {
    let totals: number[] = [];
    let labels: string[] = [];
    this.productService.getSumProductOrderList(this.searchForm).subscribe((response: any) => {
      const productList = response as { name: string, total: number }[];
      productList.forEach(el => {
        labels.push(el.name);
        totals.push(Number(el.total));
      });

      this.pieChartData.labels = labels;
      this.pieChartData.datasets[0].data = totals;

      let clone = JSON.parse(JSON.stringify(this.pieChartData));
      clone.labels = this.pieChartData.labels;
      clone.datasets[0].data = this.pieChartData.datasets[0].data;
      this.pieChartData = clone;
    });
  }

  onSearch() {
    this.searchForm.agencyId = this.agencySelected !== null ? this.agencySelected.id : 0;
    this.searchForm.productId = this.productSelected !== null ? this.productSelected.id : 0;
    this.searchForm.status = this.selectedStatus !== null ? this.selectedStatus.value : 0;
    this.searchForm.startDate = this.range.value.start !== null ? moment(this.range.value.start).format('DD/MM/YYYY') : '';
    this.searchForm.endDate = this.range.value.end !== null ? moment(this.range.value.end).format('DD/MM/YYYY') : '';
    this.getDataChartByDate();
    this.getDataChartPie();
    this.resetFormSearch();
  }

  resetFormSearch() {
    this.agencySelected = null;
    this.productSelected = null;
    this.selectedStatus = null;
    this.searchForm.approvedNumber = 0;
    this.searchForm.agencyId = 0;
    this.searchForm.productId = 0;
    this.searchForm.status = 0;
    this.searchForm.startDate = null;
    this.searchForm.endDate = null;
    this.range.reset();
  }

  compareObj(obj1: any[], obj2: any): string {
    const obj = obj1.find(x => x.id === obj2);
    if (obj) {
      return obj.label;
    }
    return '';
  }
}
