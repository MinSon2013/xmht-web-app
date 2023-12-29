import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from '../models/product';
import { CustomPaginator } from '../common/custom-paginator';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { ProductService } from '../services/product.service';
import { DialogDetailProductComponent } from './dialog-detail-product/dialog-detail-product.component';
import { SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../constants/const-data';
import { Helper } from '../helpers/helper';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class ProductsComponent implements OnInit {

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
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    if (this.isStocker || this.isAreaManager) {
      this.displayedColumns = ['id', 'productName', 'quantity', 'price', 'note'];
    }
    this.colspan = this.displayedColumns.length;
    const productList = this.helper.getProductList();
    if (productList.length === 0) {
      this.productService.getProductList().subscribe((response: any) => {
        this.helper.setProductList(response);
        this.dataSource.data = response.length > 0 ? response.reverse() : [];
      });
    } else {
      this.dataSource.data = productList.length > 0 ? productList.reverse() : [];
    }

    this.hideShowNoDataRow();
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
    const dialogRef = this.dialog.open(DialogDetailProductComponent, {
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
          row.price = result.price;
          row.quantity = result.quantity;
          row.note = result.note;
        } else {
          this.dataSource.data = [result, ...this.dataSource.data];
          this.dataSource.data = this.dataSource.data;
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
        this.helper.deleteProduct(row);
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

