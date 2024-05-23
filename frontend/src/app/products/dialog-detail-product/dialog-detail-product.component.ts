import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Helper } from '../../helpers/helper';
import { Product } from '../../models/product';
import { MyErrorStateMatcher } from '../../orders/order-add/order-add.component';
import { ProductService } from '../../services/product.service';
import { MSG_STATUS, PRODUCT_CATEGORIES, STOCKER_ROLE, USER_AREA_MANAGER_ROLE } from '../../constants/const-data';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-dialog-detail-product',
  templateUrl: './dialog-detail-product.component.html',
  styleUrls: ['./dialog-detail-product.component.scss']
})
export class DialogDetailProductComponent implements OnInit {
  header: string = '';
  error: any = '';
  matcher = new MyErrorStateMatcher();

  helper = new Helper();
  product = {
    id: 0,
    name: '',
    quantity: '',
    price: '',
    note: '',
    updatedByUserId: 0,
    category: 0,
  };

  role: number = this.helper.getUserRole();
  isStocker: boolean = this.role === STOCKER_ROLE;
  hidden: boolean = (this.role === USER_AREA_MANAGER_ROLE || this.isStocker);

  categories = PRODUCT_CATEGORIES;
  categorySelected: any = null;
  categoryError = "";

  constructor(
    public dialogRef: MatDialogRef<DialogDetailProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    public translate: TranslateService,
    private toastr: ToastrService,
    private productService: ProductService,
    private socketService: SocketService,
  ) { dialogRef.disableClose = true; }

  ngOnInit(): void {
    if (this.data && this.data.id !== 0) {
      this.translate.get('PRODUCT.TITLE_MODIFIED').subscribe(x => { this.header = x });
      this.product.id = this.data.id;
      this.product.name = this.data.name;
      this.product.quantity = this.data.quantity.toString();
      this.product.price = this.data.price.toString();
      this.product.note = this.data.note;
      this.product.category = this.data.category;
      this.categorySelected = PRODUCT_CATEGORIES.find(x => x.value === this.data.category);
    } else {
      this.translate.get('PRODUCT.TITLE_ADD').subscribe(x => { this.header = x });
    }
  }

  onSubmit() {
    if (this.validForm()) {
      this.product.category = this.categorySelected.value;
      if (this.product.id === 0) {
        this.socketService.createdProduct(this.product).subscribe((response: any) => {
          if (response) {
            this.product.id = response.id;
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_PRODUCT', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.product);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_PRODUCT', MSG_STATUS.FAIL));
          }
        });
      } else {
        this.socketService.updatedProduct(this.product).subscribe((response: any) => {
          if (response) {
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_PRODUCT', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.product);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_PRODUCT', MSG_STATUS.FAIL));
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  validForm(): boolean {
    let isValidForm: boolean = true;
    if (this.product.name.length === 0) {
      isValidForm = false;
    } else if (this.product.quantity.length === 0) {
      isValidForm = false;
    } else if (this.product.price.length === 0) {
      isValidForm = false;
    } else {
      this.error = '';
      isValidForm = true;
    }
    if (!this.categorySelected || this.categorySelected.value === 0) {
      isValidForm = false;
      this.categoryError = "Vui lòng chọn chủng loại";
    } else {
      this.categoryError = "";
    }

    if (!isValidForm) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    }
    return isValidForm;
  }

  focusNext(id: string) {
    document.getElementById(id)?.focus();
  }

  onlyNumberKey(event: any) {
    return this.helper.onlyNumberKey(event);
  }
}
