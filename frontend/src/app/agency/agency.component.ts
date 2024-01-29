import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Agency } from '../models/agency';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { DialogDetailAgencyComponent } from './dialog-detail-agency/dialog-detail-agency.component';
import { AgencyService } from '../services/agency.service';
import { AGENCY_ROLE, SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import { Helper } from '../helpers/helper';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-agency',
  templateUrl: './agency.component.html',
  styleUrls: ['./agency.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class AgencyComponent implements OnInit {

  displayedColumns: string[] = ['id', 'agencyName', 'address', 'phone', 'email', 'contract', 'note', 'deleteAction'];
  dataSource = new MatTableDataSource<Agency>();
  clickedRows = new Set<Agency>();
  colspan: number = 0;
  sticky: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = false;
  userRole: number = this.helper.getUserRole();
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isStocker: boolean = this.userRole === STOCKER_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;

  constructor(public dialog: MatDialog,
    private agencyService: AgencyService,
    private deviceService: DeviceDetectorService,
  ) {
    this.epicFunction();
  }

  ngOnInit(): void {
    if (this.isStocker || this.isAreaManager) {
      this.displayedColumns = ['id', 'agencyName', 'address', 'phone', 'email', 'contract', 'note'];
    }
    this.colspan = this.displayedColumns.length;
    this.agencyService.getAgencyList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response.reverse();
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
    const dialogRef = this.dialog.open(DialogDetailAgencyComponent, {
      data: row,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        if (row && row.id !== 0) {
          row.agencyName = result.agencyName;
          row.address = result.address;
          row.phone = result.phone;
          row.note = result.note;
          row.email = result.email;
          row.contract = result.contract;
        } else {
          this.dataSource.data = [result, ...this.dataSource.data];
          this.dataSource.data = this.dataSource.data; // push obj into datasource
          this.hideShowNoDataRow();
        }
      }
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { row, type: SERVICE_TYPE.AGENCYSERVICE, content: 'Bạn chắc chắn muốn xóa nhà phân phối "' + row.agencyName + '"?' },
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

