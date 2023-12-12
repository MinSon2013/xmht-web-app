import { Component, Inject } from '@angular/core';
import { Helper } from '../../helpers/helper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Agency } from '../../models/agency';
import { Cities } from '../../constants/const-data';
import { FormControl } from '@angular/forms';
import { Pickup } from '../../models/pickup';

@Component({
  selector: 'app-dialog-modify-district',
  templateUrl: './dialog-modify-district.component.html',
  styleUrls: ['./dialog-modify-district.component.scss']
})
export class DialogModifyDistrictComponent {
  header: string = '';
  helper = new Helper();
  cities: Pickup[] = Cities;

  error: any = '';
  disabled: boolean = false;
  provinceError: string = '';

  district = {
    id: 0,
    name: '',
    province: '',
  };

  provinces = new FormControl<Pickup[] | null>(null);

  constructor(
    public dialogRef: MatDialogRef<DialogModifyDistrictComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Agency,
    public translate: TranslateService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    if (this.data && this.data.id !== 0) {
      //  this.disabled = true;
      this.translate.get('DISTRICT.TITLE_MODIFIED').subscribe(data => { this.header = data });
      //this.agency.id = this.data.id;
    } else {
      this.translate.get('DISTRICT.TITLE_ADD').subscribe(data => { this.header = data });
      // this.disabled = false;
    }
  }

  onSubmit() {
    const y = this.provinces.value ? this.provinces.value[0].label : '';
    if (this.validForm()) {
      // if (this.agency.id === 0) {
      //   this.agencyService.create(this.agency).subscribe((response: any) => {
      //     if (response) {
      //       this.agency.id = response.id;
      //       this.agency.userId = response.userId;
      //       this.helper.addAgency(this.agency);

      //       const user: User = {
      //         id: response.userId,
      //         username: this.agency.accountName,
      //         password: this.agency.password,
      //         isAdmin: false,
      //       };
      //       this.helper.addUser(user);

      //       this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_AGENCY', MSG_STATUS.SUCCESS));
      //       this.dialogRef.close(this.agency);
      //     } else {
      //       this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_AGENCY', MSG_STATUS.FAIL));
      //     }
      //   });
      // } else {
      //   this.agencyService.update(this.agency).subscribe((response: any) => {
      //     if (response) {
      //       this.helper.updateAgency(this.agency);
      //       this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_AGENCY', MSG_STATUS.SUCCESS));
      //       this.dialogRef.close(this.agency);
      //     } else {
      //       this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_AGENCY', MSG_STATUS.FAIL));
      //     }
      //   });
      // }
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  validForm(): boolean {
    let isValidForm: boolean = true;
    if (this.district.name.length === 0) {
      isValidForm = false;
    }

    if (this.provinces.value?.length === 0 || !this.provinces.value) {
      isValidForm = false;
    }

    if (!isValidForm) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    } else {
      this.error = '';
      isValidForm = true;
    }

    return isValidForm;
  }

}
