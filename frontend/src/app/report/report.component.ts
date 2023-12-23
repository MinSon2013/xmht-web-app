import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Cities, SERVICE_TYPE } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { Store } from '../models/store';
import { StoreService } from '../services/store.service';
import { DistrictService } from '../services/district.service';
import { Router } from '@angular/router';
import { DialogModifyReportComponent } from './dialog-modify-report/dialog-modify-report.component';
import { MatTableDataSource } from '@angular/material/table';
import { Reports } from '../models/report';
import { ReportService } from '../services/report.service';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  displayedColumns: string[] = ['rowId', 'updateDateVisisble', 'provinceName', 'storeName', 'agencyName', 'storeInformation', 'reportContent', 'attachFile', 'note', 'deleteAction'];
  dataSource = new MatTableDataSource<Reports>();
  clickedRows = new Set<Store>();
  colspan: number = 0;
  spanningColumns = ['rowId', 'updateDateVisisble', 'provinceName'];
  // spanningColumns = ['id', 'updateDate', 'provinceName'];
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
  districtSelected: any = null;
  cities = Cities;
  storeList: any[] = [];

  date = new FormControl(new Date());

  constructor(public dialog: MatDialog,
    private reportService: ReportService,
    private districtService: DistrictService,
    public router: Router,
    private storeService: StoreService,
  ) {
    this.getDistrict();
    this.getStoreList();
    this.agencyList = this.helper.getAgencyList();
  }

  ngOnInit(): void {
    this.colspan = this.displayedColumns.length;
    this.getData();
  }

  getData() {
    this.reportService.getReportList().subscribe((response: any) => {
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

  getStoreList() {
    this.storeService.getStoreList().subscribe((response: any) => {
      if (response.length > 0) {
        this.storeList = response;
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
    const dialogRef = this.dialog.open(DialogModifyReportComponent, {
      data: { row, districtList: this.districtList, storeList: this.storeList },
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

  onReport() {
    this.router.navigate(['report']);
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
    let r = 0;
    let upd = '';
    this.dataSource.data.forEach(element => {
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

      const store = this.storeList.find(x => x.id === Number(element.storeId));
      if (store) {
        element.storeName = store.storeName;
      }
    });

    // this.cacheSpan('id', (d: { id: number; }) => d.id);
    // this.cacheSpan('updateDate', (d: { id: number; updateDate: string; }) => d.id + d.updateDate);
    // this.cacheSpan('provinceName', (d: { id: number; updateDate: string; provinceName: string; }) => d.id + d.updateDate + d.provinceName);

    this.cacheSpan('rowId', (d: { rowId: number; }) => d.rowId);
    this.cacheSpan('updateDateVisisble', (d: { rowId: number; updateDateVisisble: string; }) => d.rowId + d.updateDateVisisble);
    this.cacheSpan('provinceName', (d: { rowId: number; updateDateVisisble: string; provinceName: string; }) => d.rowId + d.updateDateVisisble + d.provinceName);

  }

  onDownload(row: any) {
    this.reportService.downloadFile(row.id)
  }

  onSearch() {
    this.spans = [];
    const districtId = this.districtSelected ? this.districtSelected.id : 0;
    let date = '';
    if (this.date.value) {
      date = moment(this.date.value).format('DD/MM/YYYY');
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

}
