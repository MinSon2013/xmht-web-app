import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { Helper } from '../../helpers/helper';
import { MSG_STATUS } from '../../constants/const-data';
import { MyErrorStateMatcher } from '../../orders/order-add/order-add.component';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-dialog-change-password',
  templateUrl: './dialog-change-password.component.html',
  styleUrls: ['./dialog-change-password.component.scss']
})
export class DialogChangePasswordComponent implements OnInit {
  matcher = new MyErrorStateMatcher();
  userId: number = 0;
  header: string = 'Thay đổi mật khẩu';
  error = "";
  errorPassword = '';
  users = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  helper = new Helper();
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public translate: TranslateService,
    private toastr: ToastrService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.userId = Number(this.data.userId);
    }
  }

  onSubmit() {
    this.loading = true;
    if (this.validForm()) {
      const payload = {
        userId: this.userId,
        newPassword: this.users.newPassword,
        oldPassword: this.users.oldPassword,
      };
      this.userService.changePassword(payload).subscribe({
        error: error => {
          this.loading = false;
          if (error.error.statusCode === HttpStatusCode.BadRequest) {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.PASSWORD_WRONG', 0));
          } else if (error.error.statusCode === 404) {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.NOT_FOUND', 0));
            this.dialogRef.close();
          }
        },
        complete: () => console.log('Complete!'),
        next: (value) => {
          this.loading = false;
          if (value) {
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.CHANGE_PASSWORD', MSG_STATUS.SUCCESS));
            this.dialogRef.close();
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.CHANGE_PASSWORD', MSG_STATUS.FAIL));
          }
        },
      });
    } else {
      this.loading = false;
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  validForm(): boolean {
    let isValidForm: boolean = true;
    if (this.users.oldPassword.length === 0) {
      isValidForm = false;
    }
    if (this.users.newPassword.length === 0) {
      isValidForm = false;
    }
    if (this.users.confirmNewPassword.length === 0) {
      isValidForm = false;
    }

    if (!isValidForm) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    } else {
      if (!this.passwordsMatching()) {
        this.error = '';
        this.errorPassword = 'Mật khẩu mới không khớp';
        return false;
      }
      this.error = '';
      this.errorPassword = '';
      isValidForm = true;
    }

    return isValidForm;
  }

  passwordsMatching() {
    if ((this.users.newPassword === this.users.confirmNewPassword)
      && (this.users.newPassword !== null && this.users.confirmNewPassword !== null)
      && (this.users.newPassword.length !== 0 && this.users.confirmNewPassword.length !== 0)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
