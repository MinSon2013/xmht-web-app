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
import { SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import { Helper } from '../helpers/helper';

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
  // displayedColumns: string[] = ['id', 'agencyName', 'address', 'phone', 'email', 'userName', 'contract', 'note', 'deleteAction'];
  dataSource = new MatTableDataSource<Agency>();
  clickedRows = new Set<Agency>();
  colspan: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  helper = new Helper();
  hasData: boolean = false;
  role: number = this.helper.getUserRole();
  hidden: boolean = (this.role === USER_AREA_MANAGER_ROLE || this.role === STOCKER_ROLE);

  constructor(public dialog: MatDialog,
    private agencyService: AgencyService,
  ) { }

  ngOnInit(): void {
    this.colspan = this.displayedColumns.length;
    // const agencyList = this.helper.getAgencyList();
    //if (agencyList.length === 0) {
    this.agencyService.getAgencyList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = response.reverse();
        this.helper.setAgencyList(response);
      } else {
        this.dataSource.data = [];
      }
      this.hideShowNoDataRow();
    });
    // } else {
    //   this.dataSource.data = agencyList.reverse();
    //   this.hideShowNoDataRow();
    // }
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

