import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Cities, SERVICE_TYPE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { Store } from '../models/store';
import { Router } from '@angular/router';
import { DialogModifyReportComponent } from './dialog-modify-report/dialog-modify-report.component';
import { MatTableDataSource } from '@angular/material/table';
import { Reports } from '../models/report';
import { ReportService } from '../services/report.service';
import { FormControl } from '@angular/forms';
import { CustomMatPaginatorIntl } from '../common/custom-paginator';
import { CustomSocket } from '../sockets/custom-socket';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CONFIG } from '../common/config';
import { RoutesService } from '../services/routes.service';
import { concatMap, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }
  ]
})
export class ReportComponent implements OnInit {
  readonly routingReport = CONFIG.APP_ROUTING.REPORT;

  displayedColumns: string[] = ['rowId', 'updateDateVisisble', 'provinceName', 'storeName', 'agencyName', 'storeInformation', 'reportContent', 'attachFile', 'note', 'deleteAction'];
  dataSource = new MatTableDataSource<Reports>();
  clickedRows = new Set<Store>();
  colspan: number = 0;
  spanningColumns = ['rowId', 'updateDateVisisble', 'provinceName'];
  spans: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = true;
  agencyList: any[] = [];
  districtList: any[] = [];
  storeList: any[] = [];
  districtSelected: any = null;
  cities = Cities;

  userRole: number = this.helper.getUserRole();
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;

  date = new FormControl(null);
  MAX_LENGTH_SHORT_CONTENT: number = 80;

  districtId: number = 0;
  sticky: boolean = true;

  constructor(public dialog: MatDialog,
    private reportService: ReportService,
    public router: Router,
    private socket: CustomSocket,
    private deviceService: DeviceDetectorService,
    private routesService: RoutesService,
  ) {
    this.epicFunction();
  }

  ngOnInit() {
    if (this.isSalesman) {
      this.displayedColumns = ['rowId', 'updateDateVisisble', 'provinceName', 'storeName', 'agencyName', 'storeInformation', 'reportContent', 'attachFile', 'note'];
    }
    this.colspan = this.displayedColumns.length;

    this.onRequestServer();
    this.emitSocket();
  }

  onRequestServer() {
    this.routesService.getAgencyList().pipe(
      tap((res) => {
        if (res.length > 0) {
          this.agencyList = res;
        }
      }),
      concatMap(() => this.routesService.getStoreList()),
      tap((res0) => {
        if (res0.length > 0) {
          this.storeList = res0;
        }
      }),
      switchMap((result) => {
        if (!this.isAreaManager) {
          console.log('not true');
          return of(result);
        } else {
          return this.routesService.getUserDistrictList();
        }
      }),
      tap((res1) => {
        if (res1) {
          this.districtId = res1;
        }
      }),
      concatMap(() => this.routesService.getDistrictList()),
      tap((res2) => {
        if (res2.length > 0) {
          this.districtList = res2;
          if (this.isAreaManager) {
            this.districtList = this.districtList.filter(x => x.id === this.districtId);
          }
        }
      }),
      concatMap(() => this.routesService.getReportList()),
      tap((res3) => {
        this.generalReportList(res3);
      }),
    ).subscribe(success => {
      console.log('success');
    }, errorData => {
      console.log('error');
    })
  }

  generalReportList(response: any[]) {
    if (response.length > 0) {
      this.dataSource.data = response;
      this.convertData();
    } else {
      this.dataSource.data = [];
    }
    this.hideShowNoDataRow();
  }

  emitSocket() {
    this.socket.on('emitGetReportList', (response: Reports[]) => {
      this.getReportList();
    })
  }

  getReportList() {
    this.reportService.getReportList().subscribe((response: any) => {
      this.generalReportList(response);
    });
  }

  hideShowNoDataRow() {
    if (this.dataSource.data.length === 0) {
      this.hasData = false;
    } else {
      this.hasData = true;
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onEdit(row: any) {
    const elements = Array.from(
      document.getElementsByClassName('body') as HTMLCollectionOf<HTMLElement>,
    );
    const dialogRef = this.dialog.open(DialogModifyReportComponent, {
      data: {
        row,
        districtList: this.districtList,
        storeList: this.storeList,
        agencyList: this.agencyList,
        disableClose: true,
      },
      panelClass: 'my-panel',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        if (row && row.id !== 0) {
          row.storeInformation = result.storeInformation;
          row.reportContent = result.reportContent;
          row.note = result.note;
          row.agencyId = result.agencyId;
          row.districtId = result.districtId;
          row.provinceId = result.provinceId;
          row.storeId = result.storeId;
          row.filePath = result.filePath;
          row.attachFile = result.attachFile;
          row.updateDate = result.updateDate;
          this.convertData();
        } else {
          this.spans = [];
          this.dataSource.data = [];
          this.getReportList();
        }
      }
    });
  }

  onDelete(row: any) {
    const name = !row.storeName ? row.otherStoreName : row.storeName;
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.REPORTSERVICE, content: 'Bạn chắc chắn muốn xóa "' + name + '"?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spans = [];
        this.dataSource.data = [];
        this.getReportList();
        if (this.dataSource.data.length === 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
        }
      }
    });
  }

  onReport() {
    this.router.navigate([this.routingReport]);
  }

  cacheSpan(key: string, accessor: any) {
    for (let i = 0; i < this.dataSource.data.length;) {
      let currentValue = accessor(this.dataSource.data[i]);
      let count = 1;

      for (let j = i + 1; j < this.dataSource.data.length; j++) {
        if (currentValue != accessor(this.dataSource.data[j])) {
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

  getRowSpan(col: string, index: number) {
    return this.spans[index] && this.spans[index][col];
  }

  convertData(up?: string) {
    this.spans = [];
    let r = 0;
    let upd = '';
    this.dataSource.data.forEach(element => {
      element.showContent = element.reportContent;
      if (element.reportContent.length > this.MAX_LENGTH_SHORT_CONTENT) {
        element.showContent = element.reportContent.substring(0, (this.MAX_LENGTH_SHORT_CONTENT - 1));
        element.showLabel = "...[Chi tiết]";
        element.showDetail = false;
      }

      element.updateDateVisisble = element.updateDate.split(' ')[1];
      if (upd.length === 0) {
        element.rowId = 1;
        r = 1;
        upd = element.updateDateVisisble;
      } else if (upd === element.updateDateVisisble) {
        element.rowId = r;
      } else {
        r = r + 1;
        element.rowId = r;
        upd = element.updateDateVisisble;
      }

      const agency = this.agencyList.find(x => x.id === Number(element.agencyId));
      if (agency) {
        element.agencyName = agency.agencyName;
      }

      const district = this.districtList.find(x => x.id === Number(element.districtId));
      if (district) {
        element.districtName = district.name;
      }

      const province = this.cities.find(x => x.id === Number(element.provinceId));
      if (province) {
        element.provinceName = province.label;
      }

      const store = this.storeList.find(x => x.id === Number(element.storeId));
      if (store) {
        element.storeName = store.storeName;
      }
    });

    this.cacheSpan('rowId', (d: { rowId: number; }) => d.rowId);
    this.cacheSpan('updateDateVisisble', (d: { rowId: number; updateDateVisisble: string; }) => d.rowId + d.updateDateVisisble);
    this.cacheSpan('provinceName', (d: { rowId: number; updateDateVisisble: string; provinceName: string; }) => d.rowId + d.updateDateVisisble + d.provinceName);

  }

  onDownload(row: any) {
    this.reportService.downloadFile(row.id)
  }

  onSelected(event: any) {
    this.onSearch();
  }

  onSearch() {
    this.spans = [];
    const districtId = this.districtSelected ? this.districtSelected.id : 0;
    let date = '';
    if (this.date.value) {
      date = this.helper.getDateFormat(3, this.date.value);
    }

    this.reportService.search(districtId, date).subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response;
        this.dataSource.paginator = this.paginator;
        this.convertData();
        this.hasData = true;
      } else {
        this.dataSource.data = [];
        this.hasData = false;
      }
    });
  }

  showDetail(element: any) {
    if (element.showDetail) {
      if (element.reportContent.length > this.MAX_LENGTH_SHORT_CONTENT) {
        element.showLabel = "...[Chi tiết]";
        element.showDetail = false;
        element.showContent = element.reportContent.substring(0, (this.MAX_LENGTH_SHORT_CONTENT - 1));
      } else {
        element.showContent = element.reportContent;
      }

    } else {
      element.showLabel = " [Ẩn bớt]";
      element.showDetail = true;
      element.showContent = element.reportContent;
    }
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
