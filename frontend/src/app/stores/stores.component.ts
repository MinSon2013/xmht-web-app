import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Cities, SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { Store } from '../models/store';
import { DialogModifyStoreComponent } from './dialog-modify-store/dialog-modify-store.component';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { concatMap, of, switchMap, tap } from 'rxjs';
import { RoutesService } from '../services/routes.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }
  ]
})
export class StoresComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['agencyName', 'districtName', 'provinceName', 'storeName', 'address', 'phone', 'deleteAction'];
  dataSource = new MatTableDataSource<Store>();
  clickedRows = new Set<Store>();
  colspan: number = 0;
  spanningColumns = ['agencyName', 'districtName', 'provinceName'];
  spans: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = true;
  isUser = true;
  agencyList: any[] = [];
  districtList: any[] = [];
  cities = Cities;
  isAdmin: boolean = this.helper.isAdmin();
  isStocker: boolean = this.helper.getUserRole() === STOCKER_ROLE;
  isAreaManager: boolean = this.helper.getUserRole() === USER_AREA_MANAGER_ROLE;
  districtId: number = 0;
  sticky: boolean = true;

  constructor(public dialog: MatDialog,
    public router: Router,
    private deviceService: DeviceDetectorService,
    private routesService: RoutesService,
  ) {
    this.epicFunction();
  }

  ngOnInit(): void {
    if (this.isStocker) {
      this.displayedColumns = ['agencyName', 'districtName', 'provinceName', 'storeName', 'address', 'phone'];
    }
    this.colspan = this.displayedColumns.length;

    this.onRequestServer();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void { }

  onRequestServer() {
    this.routesService.getAgencyList().pipe(
      tap((res) => {
        if (res.length > 0) {
          this.agencyList = res;
        }
      }),
      switchMap((result) => {
        if (!this.isAreaManager) {
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
      tap((res1) => {
        if (res1.length > 0) {
          this.districtList = res1;
          if (this.isAreaManager) {
            this.districtList = this.districtList.filter(x => x.id === this.districtId);
          }
        }
      }),
      concatMap(() => this.routesService.getStoreList()),
      tap((res2) => {
        this.generalStoreList(res2);
      }),
    ).subscribe(success => {
      console.log('success');
    }, errorData => {
      console.log('error');
    })
  }

  generalStoreList(response: any[]) {
    if (response.length > 0) {
      this.dataSource.data = response;
      if (this.isAreaManager) {
        this.dataSource.data = this.dataSource.data.filter(x => x.districtId === this.districtId);
      }
      this.convertData();
    } else {
      this.dataSource.data = [];
    }
    this.hideShowNoDataRow();
  }

  getStoreList() {
    this.routesService.getStoreList().subscribe((response: any) => {
      this.generalStoreList(response);
    });
  }

  hideShowNoDataRow() {
    if (this.dataSource.data.length === 0) {
      this.hasData = false;
    } else {
      this.hasData = true;
    }
  }

  onEdit(row: any) {
    const elements = Array.from(
      document.getElementsByClassName('body') as HTMLCollectionOf<HTMLElement>,
    );
    const dialogRef = this.dialog.open(DialogModifyStoreComponent, {
      data: {
        row,
        districtList: this.districtList,
        agencyList: this.agencyList,
        disableClose: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        if (row && row.id !== 0) {
          row.storeName = result.storeName;
          row.address = result.address;
          row.phone = result.phone;
          row.note = result.note;
          row.agencyId = result.agencyId;
          row.districtId = result.districtId;
          row.provinceId = result.provinceId;

          const agency = this.agencyList.find(x => x.id === Number(row.agencyId));
          if (agency) {
            row.agencyName = agency.agencyName;
          }

          const district = this.districtList.find(x => x.id === Number(row.districtId));
          if (district) {
            row.districtName = district.name;
          }

          const province = this.cities.find(x => x.id === Number(row.provinceId));
          if (province) {
            row.provinceName = province.label;
          }

          this.cacheSpan('agencyName', (d: { agencyName: string; }) => d.agencyName);
          this.cacheSpan('districtName', (d: { agencyName: string; districtName: string; }) => d.agencyName + d.districtName);
          this.cacheSpan('provinceName', (d: { agencyName: string; districtName: string; provinceName: string; }) => d.agencyName + d.districtName + d.provinceName);
        } else {
          this.spans = [];
          this.dataSource.data = [];
          this.getStoreList();

        }
      }
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.STORESERVICE, content: 'Bạn chắc chắn muốn xóa "' + row.storeName + '"?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spans = [];
        this.dataSource.data = [];
        this.getStoreList();
        if (this.dataSource.data.length === 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
        }
      }
    });
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

  convertData() {
    this.dataSource.data.forEach(element => {
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
    });
    this.cacheSpan('agencyName', (d: { agencyName: string; }) => d.agencyName);
    this.cacheSpan('districtName', (d: { agencyName: string; districtName: string; }) => d.agencyName + d.districtName);
    this.cacheSpan('provinceName', (d: { agencyName: string; districtName: string; provinceName: string; }) => d.agencyName + d.districtName + d.provinceName);
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