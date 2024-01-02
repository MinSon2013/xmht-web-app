import { Component, Inject } from '@angular/core';
import { Helper } from '../../helpers/helper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Cities, MSG_STATUS } from '../../constants/const-data';
import { FormControl } from '@angular/forms';
import { Pickup } from '../../models/pickup';
import { District } from '../../models/district';
import { DistrictService } from '../../services/district.service';

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
  provinceError: string = '';

  district: District = {
    id: 0,
    name: '',
    provinceId: '',
    updatedByUserId: this.helper.getUserId(),
    provinceList: []
  };

  provinces = new FormControl<Pickup[]>([]);

  constructor(
    public dialogRef: MatDialogRef<DialogModifyDistrictComponent>,
    @Inject(MAT_DIALOG_DATA) public data: District,
    public translate: TranslateService,
    private toastr: ToastrService,
    private districtService: DistrictService,
  ) { dialogRef.disableClose = true; }

  ngOnInit(): void {
    if (this.data && this.data.id !== 0) {
      this.translate.get('DISTRICT.TITLE_MODIFIED').subscribe(data => { this.header = data });
      this.district.id = this.data.id;
      this.district.name = this.data.name;
      this.district.provinceId = this.data.provinceId;
      const list = this.district.provinceId.split(',');
      if (list.length > 0) {
        list.forEach(id => {
          const item = this.cities.find(x => x.id === Number(id));
          if (item) {
            this.provinces.value?.push(item);
          }
        });
      }
    } else {
      this.provinces = new FormControl<Pickup[] | null>(null);
      this.translate.get('DISTRICT.TITLE_ADD').subscribe(data => { this.header = data });
    }
  }

  onSubmit() {
    if (this.validForm()) {
      const provinces = this.provinces.value ? this.provinces.value : [];
      const provinceId: number[] = [];
      provinces.forEach(x => {
        provinceId.push(x.id);
      });
      this.district.provinceId = provinceId.toString();
      provinceId.forEach(id => {
        const item = this.cities.find(x => x.id === Number(id));
        if (item) {
          this.district.provinceList.push(item.label);
        }
      });
      if (this.district.id === 0) {
        this.districtService.create(this.district).subscribe((response: any) => {
          if (response) {
            this.district.id = response.id;
            this.district.name = response.name;
            this.district.provinceId = response.provinceId;
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_DISTRICT', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.district);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_DISTRICT', MSG_STATUS.FAIL));
          }
        });
      } else {
        this.districtService.update(this.district).subscribe((response: any) => {
          if (response) {
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_DISTRICT', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.district);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_DISTRICT', MSG_STATUS.FAIL));
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

  focusNext(id: string) {
    document.getElementById(id)?.focus();
  }

}
