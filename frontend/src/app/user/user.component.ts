import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { SERVICE_TYPE, USER_ROLE } from '../constants/const-data';
import { Helper } from '../helpers/helper';
import { DialogModifyUserComponent } from './dialog-modify-user/dialog-modify-user.component';
import { DistrictService } from '../services/district.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class UserComponent implements OnInit {

  displayedColumns: string[] = ['id', 'username', 'fullName', 'role', 'district', 'deleteAction'];
  dataSource = new MatTableDataSource<User>();
  clickedRows = new Set<User>();
  colspan: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = false;
  isAdmin: boolean = this.helper.isAdmin();

  districtList: any[] = [];
  roleSelected: any = null;
  roleList = USER_ROLE;

  constructor(public dialog: MatDialog,
    private districtService: DistrictService,
    private userService: UserService,
  ) {
    this.getDistrict();
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.displayedColumns = ['id', 'username', 'fullName', 'role', 'district'];
    }
    this.colspan = this.displayedColumns.length;
    this.getData();
  }

  getData() {
    this.userService.getUserList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response;
        // if (!this.isAdmin && !this.isStocker) {
        //   const userId = this.helper.getUserId();
        //   this.dataSource.data = this.dataSource.data.filter(x => x.id === userId);
        // }
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

  convertData() {
    this.dataSource.data.forEach(element => {
      const role = this.roleList.find(x => x.value === element.role)
      element.roleLabel = role ? role.label : '';
      if (element.districtId) {
        const district = this.districtList.find(y => y.id === element.districtId);
        element.districtName = district ? district.name : '';
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
    const dialogRef = this.dialog.open(DialogModifyUserComponent, {
      data: { row, districtList: this.districtList },
    });

    // elements.forEach(el => {
    //   el.style.position = 'fixed';
    // });

    dialogRef.afterClosed().subscribe(result => {
      // elements.forEach(el => {
      //   el.style.position = 'relative';
      // });
      if (result !== null) {
        if (row && row.id !== 0) {
          row.fullName = result.fullName;
          row.districtId = result.districtId;
          row.role = result.role;
          row.districtName = '';
        } else {
          this.dataSource.data = [result, ...this.dataSource.data];
          this.dataSource.data = this.dataSource.data;
          this.hideShowNoDataRow();
        }
        this.convertData();
      }
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.USERSERVICE, content: 'Bạn chắc chắn muốn xóa "' + row.accountName + '"?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.helper.deleteAgency(row);
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


