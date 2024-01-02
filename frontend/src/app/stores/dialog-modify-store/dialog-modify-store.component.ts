import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Cities, MSG_STATUS } from '../../constants/const-data';
import { Helper } from '../../helpers/helper';
import { Store } from '../../models/store';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-dialog-modify-store',
  templateUrl: './dialog-modify-store.component.html',
  styleUrls: ['./dialog-modify-store.component.scss']
})
export class DialogModifyStoreComponent {
  header: string = '';
  helper = new Helper();
  isAdmin: boolean = this.helper.isAdmin();
  cities = Cities;

  error: any = '';
  provinceError: string = '';

  agencySelected: any = null;
  agencyList: any[] = [];

  districtSelected: any = null;
  districtList: any[] = [];

  provinceSelected: any = null;
  provinceList: any[] = [];

  store: Store = {
    id: 0,
    agencyId: 0,
    storeName: '',
    districtId: 0,
    provinceId: 0,
    updateDate: '',
    address: '',
    phone: '',
    note: '',
    userId: this.helper.getUserId(),
    updatedByUserId: this.helper.getUserId(),
  };

  constructor(
    public dialogRef: MatDialogRef<DialogModifyStoreComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Store | any,
    public translate: TranslateService,
    private toastr: ToastrService,
    private storeService: StoreService,
  ) { }

  ngOnInit(): void {
    this.districtList = this.data.districtList;
    this.agencyList = this.data.agencyList;
    if (this.data.row && this.data.row.id !== 0) {
      this.translate.get('STORE.TITLE_MODIFIED').subscribe(x => { this.header = x });
      this.store.id = this.data.row.id;
      this.store.storeName = this.data.row.storeName;
      this.store.address = this.data.row.address;
      this.store.phone = this.data.row.phone;
      this.store.note = this.data.row.note;
      this.store.agencyId = this.data.row.agencyId;
      this.store.districtId = this.data.row.districtId;
      this.store.provinceId = this.data.row.provinceId;
      this.agencySelected = this.agencyList.find(x => x.id === this.data.row.agencyId);
      this.districtSelected = this.districtList.find(x => x.id === this.data.row.districtId);
      this.getProvinceList();
      this.provinceSelected = this.provinceList.find(x => x.id === this.data.row.provinceId);
    } else {
      this.translate.get('STORE.TITLE_ADD').subscribe(x => { this.header = x });
    }
  }

  onSubmit() {
    if (this.validForm()) {
      this.store.agencyId = this.agencySelected.id;
      this.store.districtId = this.districtSelected.id
      this.store.provinceId = this.provinceSelected.id;
      this.store.userId = this.helper.getUserId();
      if (this.store.id === 0) {
        this.storeService.create(this.store).subscribe((response: any) => {
          if (response) {
            this.store.id = response.id;
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_STORE', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.store);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_STORE', MSG_STATUS.FAIL));
          }
        });
      } else {
        this.storeService.update(this.store).subscribe((response: any) => {
          if (response) {
            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_STORE', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.store);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_STORE', MSG_STATUS.FAIL));
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
    if (this.store.storeName.length === 0) {
      isValidForm = false;
    }

    if (this.store.address.length === 0) {
      isValidForm = false;
    }

    if (this.store.phone.length === 0) {
      isValidForm = false;
    }

    if (!this.agencySelected || this.agencySelected.id === 0) {
      isValidForm = false;
    }

    if (!this.districtSelected || this.districtSelected.id === 0) {
      isValidForm = false;
    }

    if (!this.provinceSelected || this.provinceSelected.value === 0) {
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

  onChangeAgency(event: any) {

  }

  onChangeDistrict(event: any) {
    this.provinceList = [];
    this.getProvinceList();
  }

  onChangeProvince(event: any) {

  }

  getProvinceList() {
    const provinId: string[] = this.districtSelected?.provinceId.split(',') || [];
    provinId.forEach(id => {
      const item = this.cities.find(x => x.id === Number(id));
      if (item) {
        this.provinceList.push(item);
      }
    });
  }

  onKeyPress(params: any) {
    const inputVal = <HTMLInputElement>document.getElementById("phone");
    if (params.key === 'Backspace') {
      return true;
    }
    else if (!this.helper.isKeyPressedNumeric(params, inputVal)) {
      return false;
    }
    return true;
  }

}
