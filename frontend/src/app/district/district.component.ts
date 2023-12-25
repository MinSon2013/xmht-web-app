import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { Cities, SERVICE_TYPE, USER_AREA_MANAGER } from '../constants/const-data';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Helper } from '../helpers/helper';
import { DialogModifyDistrictComponent } from './dialog-modify-district/dialog-modify-district.component';
import { DistrictService } from '../services/district.service';
import { District } from '../models/district';
import { Pickup } from '../models/pickup';

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class DistrictComponent implements OnInit {

  displayedColumns: string[] = ['districtName', 'province', 'deleteAction'];
  dataSource = new MatTableDataSource<District>();
  clickedRows = new Set<District>();
  colspan: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = false;
  cities: Pickup[] = Cities;
  isHiddenAddButton: boolean = true;

  constructor(public dialog: MatDialog,
    private districtService: DistrictService,
  ) {
    this.isHiddenAddButton = (this.helper.isAdmin() || this.helper.getRole() === USER_AREA_MANAGER) ? false : true;
  }

  ngOnInit(): void {
    if (this.isHiddenAddButton) {
      this.displayedColumns = ['districtName', 'province'];
    }
    this.colspan = this.displayedColumns.length;
    this.getData();
  }

  getData() {
    this.districtService.getDistrictList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response;
        this.dataSource.data.forEach(element => {
          element.provinceList = [];
          const list = element.provinceId.split(',');
          if (list.length > 0) {
            list.forEach(id => {
              const item = this.cities.find(x => x.id === Number(id));
              if (item) {
                element.provinceList.push(item.label);
              }
            });
          }
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
    const dialogRef = this.dialog.open(DialogModifyDistrictComponent, {
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

