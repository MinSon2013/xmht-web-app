import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Cities, SERVICE_TYPE } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { Store } from '../models/store';
import { StoreService } from '../services/store.service';
import { DialogModifyStoreComponent } from './dialog-modify-store/dialog-modify-store.component';
import { DistrictService } from '../services/district.service';
import { Router } from '@angular/router';

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
  isStocker: boolean = this.helper.isStocker();
  // isUser: boolean = this.helper.isUser();
  isUser = true;
  agencyList: any[] = [];
  districtList: any[] = [];
  cities = Cities;

  constructor(public dialog: MatDialog,
    private storeService: StoreService,
    private districtService: DistrictService,
    public router: Router,
  ) {
    this.getDistrict();
    this.agencyList = this.helper.getAgencyList();
  }

  ngOnInit(): void {
    this.colspan = this.displayedColumns.length;
    this.getData();
  }

  getData() {
    this.storeService.getStoreList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response;
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
      data: { row, districtList: this.districtList },
    });

    elements.forEach(el => {
      el.style.position = 'fixed';
    });

    dialogRef.afterClosed().subscribe(result => {
      elements.forEach(el => {
        el.style.position = 'relative';
      });
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
            row.agencyName = agency.fullName;
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

  // onReport() {
  //   this.router.navigate(['report']);
  // }

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
        element.agencyName = agency.fullName;
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