import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '../../orders/order-add/order-add.component';
import { Agency } from '../../models/agency';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Helper } from '../../helpers/helper';
import { AGENCY, MSG_STATUS, STOCKER, USER_AREA_MANAGER } from '../../constants/const-data';
import { AgencyService } from '../../services/agency.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dialog-detail-agency',
  templateUrl: './dialog-detail-agency.component.html',
  styleUrls: ['./dialog-detail-agency.component.scss']
})
export class DialogDetailAgencyComponent implements OnInit {
  header: string = '';
  error: any = '';
  errorPassword: string = '';
  disabledUserName: boolean = false;
  helper = new Helper();

  matcher = new MyErrorStateMatcher();
  agency: Agency = {
    id: 0,
    agencyName: '',
    address: '',
    contract: '',
    phone: '',
    note: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    userId: 0,
    role: AGENCY,
    updatedByUserId: this.helper.getUserId(),
  };

  userRole: number = this.helper.getUserRole();
  disabled: boolean = (this.userRole === USER_AREA_MANAGER || this.userRole === STOCKER);

  constructor(
    public dialogRef: MatDialogRef<DialogDetailAgencyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Agency,
    public translate: TranslateService,
    private toastr: ToastrService,
    private agencyService: AgencyService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    if (this.data && this.data.id !== 0) {
      this.disabledUserName = true;
      this.translate.get('AGENCY.TITLE_MODIFIED').subscribe(data => { this.header = data });
      this.agency.id = this.data.id;
      this.agency.userId = this.data.userId;
      this.agency.agencyName = this.data.agencyName;
      this.agency.address = this.data.address;
      this.agency.phone = this.data.phone;
      this.agency.note = this.data.note;
      this.agency.userName = this.data.userName;
      this.agency.password = this.data.password;
      this.agency.email = this.data.email;
      this.agency.contract = this.data.contract;
    } else {
      this.translate.get('AGENCY.TITLE_ADD').subscribe(data => { this.header = data });
      this.disabledUserName = false;
    }
  }

  onSubmit() {
    if (this.validForm()) {
      if (this.agency.id === 0) {
        this.agencyService.create(this.agency).subscribe((response: any) => {
          if (response) {
            this.agency.id = response.id;
            this.agency.userId = response.userId;

            this.helper.addAgency(this.agency); //--------------------

            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_AGENCY', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.agency);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_AGENCY', MSG_STATUS.FAIL));
          }
        });
      } else {
        this.agencyService.update(this.agency).subscribe((response: any) => {
          if (response) {

            this.helper.updateAgency(this.agency);//--------------------

            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_AGENCY', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.agency);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_AGENCY', MSG_STATUS.FAIL));
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
    if (this.agency.agencyName.length === 0) {
      isValidForm = false;
    }
    if (this.agency.address.length === 0) {
      isValidForm = false;
    }
    if (this.agency.contract.length === 0) {
      isValidForm = false;
    }
    if (this.agency.email.length === 0) {
      isValidForm = false;
    }
    if (this.agency.userName.length === 0) {
      isValidForm = false;
    }
    if (this.agency.phone.length === 0) {
      isValidForm = false;
    }
    if (this.agency.id === 0 && this.agency.confirmPassword.length === 0) {
      isValidForm = false;
    }

    if (this.agency.id === 0 && !this.passwordsMatching()) {
      isValidForm = false;
      this.errorPassword = 'Mật khẩu không khớp';
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
    if ((this.agency.password === this.agency.confirmPassword)
      && (this.agency.password !== null && this.agency.confirmPassword !== null)
      && (this.agency.password.length !== 0 && this.agency.confirmPassword.length !== 0)
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

}
