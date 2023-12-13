import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Cities, MSG_STATUS } from '../../constants/const-data';
import { Helper } from '../../helpers/helper';
import { Store } from '../../models/store';
import { StoreService } from '../../services/store.service';
import { DistrictService } from '../../services/district.service';

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
    userId: this.helper.getUserId(),
  };

  storesFormControl = new FormControl<Store[]>([]);
  elementList: number[] = [1];

  constructor(
    public dialogRef: MatDialogRef<DialogModifyStoreComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Store,
    public translate: TranslateService,
    private toastr: ToastrService,
    private storeService: StoreService,
    private districtService: DistrictService,
  ) { }

  ngOnInit(): void {
    this.agencyList = this.helper.getAgencyList();
    this.getDistrictData();
    if (this.data && this.data.id !== 0) {
      this.translate.get('STORE.TITLE_MODIFIED').subscribe(data => { this.header = data });
      // this.district.id = this.data.id;
      // this.district.name = this.data.name;
      // this.district.provinceId = this.data.provinceId;
      // const list = this.district.provinceId.split(',');
      // if (list.length > 0) {
      //   list.forEach(id => {
      //     const item = this.cities.find(x => x.id === Number(id));
      //     if (item) {
      //       this.storesFormControl.value?.push(item);
      //     }
      //   });
      // }
    } else {
      this.storesFormControl = new FormControl<Store[] | null>(null);
      this.translate.get('STORE.TITLE_ADD').subscribe(data => { this.header = data });
    }
  }

  getDistrictData() {
    this.districtService.getDistrictList().subscribe((response: any) => {
      if (response.length > 0) {
        this.districtList = response;
      } else {
        this.districtList = [];
      }
    });
  }

  onSubmit() {
    if (this.validForm()) {
      const provinces = this.storesFormControl.value ? this.storesFormControl.value : [];
      const provinceId: number[] = [];
      provinces.forEach(x => {
        provinceId.push(x.id);
      });
      // this.district.provinceId = provinceId.toString();
      // provinceId.forEach(id => {
      //   const item = this.cities.find(x => x.id === Number(id));
      //   if (item) {
      //     this.district.provinceList.push(item.label);
      //   }
      // });
      // this.store.updateDate = moment().format('HH:mm DD/MM/YYYY');
      if (this.store.id === 0) {
        this.storeService.create(this.store).subscribe((response: any) => {
          if (response) {
            // this.district.id = response.id;
            // this.district.name = response.name;
            // this.district.provinceId = response.provinceId;
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

    if (this.storesFormControl.value?.length === 0 || !this.storesFormControl.value) {
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

  onAddElement() {
    this.elementList.push(this.elementList.length + 1);
  }

  onSubElement() {
    if (this.elementList.length > 1) {
      this.elementList.pop();
    }
  }

  onChangeDistrict(event: any) {
    const provinId: string[] = this.districtSelected.provinceId.split(',');
    provinId.forEach(id => {
      const item = this.cities.find(x => x.id === Number(id));
      if (item) {
        this.provinceList.push(item);
      }
    });
  }

  onChangeProvince(event: any) {

  }

}
