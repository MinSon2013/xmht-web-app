import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from '../models/product';
import { CustomMatPaginatorIntl } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { DialogDetailProductComponent } from './dialog-detail-product/dialog-detail-product.component';
import { SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import { Helper } from '../helpers/helper';
import { RoutesService } from '../services/routes.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }
  ]
})
export class ProductsComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['id', 'productName', 'quantity', 'price', 'note', 'deleteAction'];
  dataSource = new MatTableDataSource<Product>();
  clickedRows = new Set<Product>();
  colspan: number = 0;
  hasData: boolean = false;
  helper = new Helper();
  userRole: number = this.helper.getUserRole();
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isStocker: boolean = this.userRole === STOCKER_ROLE;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog,
    private routesService: RoutesService,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    if (this.isStocker || this.isAreaManager) {
      this.displayedColumns = ['id', 'productName', 'quantity', 'price', 'note'];
    }
    this.colspan = this.displayedColumns.length;
    this.getData();

    this.emitSocket();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void { }

  emitSocket() {
    // Listening product CRUD
    this.socketService.socketOnGetProductList().subscribe((result) => {
      this.getData();
    })
  }

  getData() {
    this.routesService.getProductList().subscribe((response: any) => {
      if (response.length > 0) {
        this.dataSource.data = this.helper.sortAZ(response, 'category');
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

  onEdit(row: any) {
    const elements = Array.from(
      document.getElementsByClassName('body') as HTMLCollectionOf<HTMLElement>,
    );
    const dialogRef = this.dialog.open(DialogDetailProductComponent, {
      data: row,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        if (row && row.id !== 0) {
          row.name = result.name;
          row.price = result.price;
          row.quantity = result.quantity;
          row.note = result.note;
          row.category = result.category;
        } else {
          this.getData();
          this.hideShowNoDataRow();
        }
      }
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.PRODUCTSERVICE, content: 'Bạn chắc chắn muốn xóa sản phẩm "' + row.name + '"?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let data = this.dataSource.data.filter(x => x.id !== row.id);
        this.dataSource.data = data;
        if (this.dataSource.data.length === 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
        }
      }
    });
  }
}

