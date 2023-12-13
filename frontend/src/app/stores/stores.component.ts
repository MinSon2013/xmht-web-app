import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { SERVICE_TYPE } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { Store } from '../models/store';
import { StoreService } from '../services/store.service';
import { DialogModifyStoreComponent } from './dialog-modify-store/dialog-modify-store.component';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class StoresComponent implements OnInit {

  displayedColumns: string[] = ['agencyName', 'districtName', 'provinceName', 'storeList', 'deleteAction'];
  dataSource = new MatTableDataSource<Store>();
  clickedRows = new Set<Store>();
  colspan: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = false;
  isStocker: boolean = this.helper.isStocker();


  constructor(public dialog: MatDialog,
    private storeService: StoreService,
  ) { }

  ngOnInit(): void {
    this.colspan = this.displayedColumns.length;
    this.getData();
  }

  getData() {
    this.storeService.getStoreList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response;
        this.dataSource.data.forEach(element => {
          // element.provinceList = [];
          // const list = element.provinceId.split(',');
          // if (list.length > 0) {
          //   list.forEach(id => {
          //     const item = this.cities.find(x => x.id === Number(id));
          //     if (item) {
          //       element.provinceList.push(item.label);
          //     }
          //   });
          // }
        });
      } else {
        this.dataSource.data = [];
      }
      this.hideShowNoDataRow();
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
      data: row,
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
          row.name = result.name;
          row.provinceId = result.provinceId;
          row.provinceList = result.provinceList;
        } else {
          this.dataSource.data = [...this.dataSource.data, result];
          this.dataSource.data = this.dataSource.data;
          this.hideShowNoDataRow();
        }
      }
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.DISTRICTSERVICE, content: 'Bạn chắc chắn muốn xóa "' + row.name + '"?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(x => x.id !== row.id);
        if (this.dataSource.data.length === 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
        }
      }
    });
  }

}


