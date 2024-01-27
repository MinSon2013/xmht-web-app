import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Helper } from '../../helpers/helper';
import { MSG_STATUS, SERVICE_TYPE } from '../../constants/const-data';
import { AgencyService } from '../../services/agency.service';
import { ProductService } from '../../services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { tap } from 'rxjs';
import { DistrictService } from '../../services/district.service';
import { StoreService } from '../../services/store.service';
import { UserService } from '../../services/user.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-dialog-delete-confirm',
  templateUrl: './dialog-delete-confirm.component.html',
  styleUrls: ['./dialog-delete-confirm.component.scss']
})
export class DialogDeleteConfirmComponent implements OnInit {
  helper = new Helper();

  constructor(
    public dialogRef: MatDialogRef<DialogDeleteConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: ProductService,
    private agencyService: AgencyService,
    private notifyService: NotificationService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private socketService: SocketService,
    private districtService: DistrictService,
    private storeService: StoreService,
    private userService: UserService,
    private reportService: ReportService,
  ) { }

  ngOnInit(): void { }

  onSubmit(data: any) {
    switch (data.type) {
      case SERVICE_TYPE.PRODUCTSERVICE:
        this.productService.delete(data.id).subscribe((response) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_PRODUCT', response);
        });
        break;
      case SERVICE_TYPE.AGENCYSERVICE:
        this.agencyService.delete(data.row.id, data.row.userId).subscribe((response) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_AGENCY', response);
        });
        break;
      case SERVICE_TYPE.ORDERSERVICE:
        this.socketService.deleteOrder(data.id).pipe(
          tap((res) => { })
        ).subscribe((response: any) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_ORDER', response);
        });
        break;
      case SERVICE_TYPE.NOTIFYSERVICE:
        this.notifyService.deleteMany(data.arrDelete).subscribe((response) => {
          this.onResponse(data.arrDelete, 'MESSAGE.DELETE_NOTIFY', response);
        });
        break;
      case SERVICE_TYPE.DISTRICTSERVICE:
        this.districtService.delete(data.id).subscribe((response) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_DISTRICT', response);
        });
        break;
      case SERVICE_TYPE.STORESERVICE:
        this.storeService.delete(data.id).subscribe((response) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_STORE', response);
        });
        break;
      case SERVICE_TYPE.USERSERVICE:
        this.userService.delete(data.id).subscribe((response) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_USER', response);
        });
        break;

      case SERVICE_TYPE.REPORTSERVICE:
        this.reportService.delete(data.id).subscribe((response) => {
          this.onResponse(data.id, 'MESSAGE.DELETE_REPORT', response);
        });
        break;
    }
  }

  onResponse(id: number | number[], key: string, response: any) {
    if (response) {
      this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, key, MSG_STATUS.SUCCESS));
      this.dialogRef.close(id);
    } else {
      this.helper.showError(this.toastr, this.helper.getMessage(this.translate, key, MSG_STATUS.FAIL));
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
