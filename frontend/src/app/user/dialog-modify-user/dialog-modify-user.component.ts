import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '../../orders/order-add/order-add.component';
import { User } from '../../models/user';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Helper } from '../../helpers/helper';
import { MSG_STATUS, USER_ROLE } from '../../constants/const-data';
import { UserService } from '../../services/user.service';
import { HttpStatusCode } from '@angular/common/http';
import { UserRO } from 'src/app/models/ro/user.ro';

@Component({
  selector: 'app-dialog-modify-user',
  templateUrl: './dialog-modify-user.component.html',
  styleUrls: ['./dialog-modify-user.component.scss']
})
export class DialogModifyUserComponent implements OnInit {
  header: string = '';
  error: any = '';
  errorPassword: string = '';

  matcher = new MyErrorStateMatcher();
  user = {
    id: 0,
    userName: '',
    password: '',
    confirmPassword: '',
    role: 0,
    districtId: 0,
    fullName: '',
  };

  districtList: any[] = [];
  districtSelected: any = null;
  roleSelected: any = null;
  roleList = USER_ROLE;
  hidden: boolean = true;

  helper = new Helper();
  isEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogModifyUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | any,
    public translate: TranslateService,
    private toastr: ToastrService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.districtList = this.data.districtList;
    this.translate.get('USER.TITLE_ADD').subscribe(data => { this.header = data });
    if (this.data.row && this.data.row.id !== 0) {
      this.translate.get('USER.TITLE_MODIFIED').subscribe(x => { this.header = x });
      this.user.id = this.data.row.id;
      this.user.fullName = this.data.row.fullName;
      this.user.districtId = this.data.row.districtId;
      this.user.role = this.data.row.role;
      this.roleSelected = this.roleList.find(x => x.value === this.data.row.role);
      this.districtSelected = this.districtList.find(x => x.id === this.data.row.districtId);
      this.isEdit = true;
      if (this.roleSelected.role === 'USER_AREA_MANAGER') {
        this.hidden = false;
      }
    }
  }

  onSubmit() {
    if (this.validForm()) {
      this.user.role = this.roleSelected?.value;
      if (this.user.id === 0) {
        this.userService.create(this.user).subscribe({
          error: error => {
            if (error.error.statusCode === HttpStatusCode.InternalServerError) {
              this.helper.showError(this.toastr, "Tên đăng nhập đã tồn tại.");
            } else {
              this.helper.showError(this.toastr, error.error.message);
            }
          },
          complete: () => console.log('Complete!'),
          next: (value) => {
            if (value) {
              const res = value as UserRO;
              this.user.id = res.id;
              this.helper.addAgency(this.user);

              // const user: User = {
              //   id: response.userId,
              //   username: this.user.username,
              //   password: this.user.password,
              //   isAdmin: false,
              //   role: this.roleSelected?.value,
              //   districtId: this.user.districtId,
              //   fullName: this.user.fullName,
              //   updatedByUserId: this.helper.getUserId(),
              // };
              // //this.helper.addUser(user);

              this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_USER', MSG_STATUS.SUCCESS));
              this.dialogRef.close(this.user);
            } else {
              this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_USER', MSG_STATUS.FAIL));
            }
          },
        });
      } else {
        this.userService.update(this.user).subscribe({
          error: error => {
            if (error.error.statusCode === HttpStatusCode.InternalServerError) {
              this.helper.showError(this.toastr, "Không thể cập nhật user");
            } else {
              this.helper.showError(this.toastr, error.error.message);
            }
          },
          complete: () => console.log('Complete!'),
          next: (response) => {
            const res = response as any;
            if (res && res.affected > 0) {
              this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_USER', MSG_STATUS.SUCCESS));
              this.dialogRef.close(this.user);
            } else {
              this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_USER', MSG_STATUS.FAIL));
            }
          },
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  validForm(): boolean {
    let isValidForm: boolean = true;
    if (this.user.userName.length === 0 && !this.isEdit) {
      isValidForm = false;
    }
    if (this.user.fullName.length === 0) {
      isValidForm = false;
    }
    if (!this.roleSelected) {
      isValidForm = false;
    } else {
      if (!this.districtSelected && this.roleSelected.role === 'USER_AREA_MANAGER') {
        isValidForm = false;
      }
    }
    if (this.user.id === 0 && this.user.confirmPassword.length === 0 && !this.isEdit) {
      isValidForm = false;
    }

    if (this.user.password.length < 8 || this.user.confirmPassword.length < 8) {
      isValidForm = false;
      this.errorPassword = 'Mật khẩu phải dài hơn 8 kí tự.';
      return isValidForm;
    }

    if (this.user.id === 0 && !this.passwordsMatching() && !this.isEdit) {
      isValidForm = false;
      this.errorPassword = 'Mật khẩu không khớp';
      return isValidForm;
    }

    if (!isValidForm) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    } else {
      this.error = '';
      isValidForm = true;
    }

    return isValidForm;
  }

  passwordsMatching() {
    if ((this.user.password === this.user.confirmPassword)
      && (this.user.password !== null && this.user.confirmPassword !== null)
      && (this.user.password.length !== 0 && this.user.confirmPassword.length !== 0)
    ) {
      return true;
    } else {
      return false;
    }
  }

  // onlyNumberKey(event: any) {
  //   var ASCIICode = (event.which) ? event.which : event.keyCode;
  //   if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) {
  //     return false;
  //   }
  //   return true;
  // }

  onlyNumberKey(event: any) {
    return this.helper.onlyNumberKey(event);
  }

  onChangeRole(event: any) {
    if (event.role === 'USER_AREA_MANAGER') {
      this.hidden = false;
    } else {
      this.hidden = true;
      this.user.districtId = 0;
    }
  }

  onChangeDistrict(event: any) {
    if (this.roleSelected.role === 'USER_AREA_MANAGER') {
      this.user.districtId = event.id;
    }
  }

}
