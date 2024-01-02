import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Cities, SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { Store } from '../models/store';
import { StoreService } from '../services/store.service';
import { DialogModifyStoreComponent } from './dialog-modify-store/dialog-modify-store.component';
import { DistrictService } from '../services/district.service';
import { Router } from '@angular/router';
import { AgencyService } from '../services/agency.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class StoresComponent implements OnInit {

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

  constructor(public dialog: MatDialog,
    private storeService: StoreService,
    private districtService: DistrictService,
    public router: Router,
    private agencyService: AgencyService,
  ) {
    this.getAgencys();
  }

  ngOnInit(): void {
    if (this.isStocker) {
      this.displayedColumns = ['agencyName', 'districtName', 'provinceName', 'storeName', 'address', 'phone'];
    }
    this.colspan = this.displayedColumns.length;
    if (this.isAreaManager) {
      this.getUserDistrict();
    }
    this.getDistrict();
    this.getData();
  }

  getData() {
    this.storeService.getStoreList().subscribe((response: any) => {
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
    });
  }

  getDistrict() {
    this.districtService.getDistrictList().subscribe((response: any) => {
      if (response.length > 0) {
        this.districtList = response;
        if (this.isAreaManager) {
          this.districtList = this.districtList.filter(x => x.id === this.districtId);
        }
      }
    });
  }

  getAgencys() {
    this.agencyService.getAgencyList().subscribe((response: any) => {
      this.agencyList = response;
    });
  }

  getUserDistrict() {
    this.districtService.getUserDistrictList().subscribe((response: any) => {
      if (response) {
        this.districtId = response;
      }
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
    const dialogRef = this.dialog.open(DialogModifyStoreComponent, {
      data: { row, districtList: this.districtList, agencyList: this.agencyList },
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
          this.getData();

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
        this.getData();
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

}