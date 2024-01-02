import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Cities, MSG_STATUS, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Helper } from '../../helpers/helper';
import { Reports } from '../../models/report';
import { ReportService } from '../../services/report.service';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-modify-report',
  templateUrl: './dialog-modify-report.component.html',
  styleUrls: ['./dialog-modify-report.component.scss']
})
export class DialogModifyReportComponent {

  header: string = '';
  helper = new Helper();
  isAdmin: boolean = this.helper.isAdmin();
  userRole: number = this.helper.getUserRole();
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;

  showOtherStore: boolean = true;
  cities = Cities;

  error: any = '';
  provinceError: string = '';

  agencySelected: any = null;
  agencyList: any[] = [];
  agencyListClone: any[] = [];

  districtSelected: any = null;
  districtList: any[] = [];
  districtListClone: any[] = [];

  provinceSelected: any = null;
  provinceList: any[] = [];

  storeSelected: any = null;
  storeList: any[] = [];
  storeDistrictList: any[] = [];

  report: Reports = {
    id: 0,
    storeId: 0,
    agencyId: 0,
    districtId: 0,
    provinceId: 0,
    storeInformation: '',
    reportContent: '',
    otherStoreName: '',
    attachFile: '',
    filePath: '',
    note: '',
    userId: this.helper.getUserId(),
    updateDate: '',
    updatedByUserId: this.helper.getUserId(),
  };

  file: any;

  constructor(
    public dialogRef: MatDialogRef<DialogModifyReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Reports | any,
    public translate: TranslateService,
    private toastr: ToastrService,
    private reportService: ReportService,
  ) { dialogRef.disableClose = true; }

  ngOnInit(): void {
    this.districtList = this.data.districtList;
    this.districtListClone = this.data.districtList;
    this.storeList = this.data.storeList;
    this.agencyList = this.data.agencyList;
    this.agencyListClone = this.data.agencyList;
    if (this.data.row && this.data.row.id !== 0) {
      this.translate.get('REPORT.TITLE_MODIFIED').subscribe(x => { this.header = x });
      this.report.id = this.data.row.id;
      this.report.storeInformation = this.data.row.storeInformation;
      this.report.reportContent = this.data.row.reportContent;
      this.report.note = this.data.row.note;
      this.report.agencyId = this.data.row.agencyId;
      this.report.districtId = this.data.row.districtId;
      this.report.provinceId = this.data.row.provinceId;
      this.report.storeId = this.data.row.storeId;
      this.report.otherStoreName = this.data.row.otherStoreName;
      this.report.filePath = this.data.row.filePath;
      this.report.attachFile = this.data.row.attachFile;
      const agency = this.agencyList.find(x => x.id === this.data.row.agencyId);
      this.agencySelected = agency ? agency : null;
      this.districtSelected = this.districtList.find(x => x.id === this.data.row.districtId);
      this.getProvinceList();
      this.provinceSelected = this.provinceList.find(x => x.id === this.data.row.provinceId);
      this.storeDistrictList = this.storeList.filter(x => x.provinceId === this.data.row.provinceId);
      this.storeSelected = this.storeList.find(x => x.id === this.data.row.storeId);
    } else {
      this.translate.get('REPORT.TITLE_ADD').subscribe(x => { this.header = x });
    }

    if (!this.agencySelected) {
      this.showOtherStore = true;
    } else {
      this.showOtherStore = false;
    }
  }

  onSubmit() {
    if (this.validForm()) {
      this.report.agencyId = this.agencySelected ? this.agencySelected.id : 0;
      this.report.districtId = this.districtSelected.id
      this.report.provinceId = this.provinceSelected.id;
      this.report.storeId = this.storeSelected ? this.storeSelected.id : 0;
      this.report.userId = this.helper.getUserId();
      this.report.file = this.file;
      this.report.fileName = this.report.attachFile;
      if (this.report.id === 0) {
        this.reportService.create(this.report).subscribe((response: any) => {
          if (response) {
            this.report.id = response.id;
            this.report.updateDate = response.updateDate;
            // Upload file
            if (this.file) {
              this.report.attachFile = this.getFilename(this.report.attachFile);
              this.report.attachFile = this.toNonAccentVietnamese(this.report.attachFile);
              this.reportService.uploadFile(this.report).subscribe((res: any) => {
                if (res.statusCode === 200) {
                  this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_REPORT', MSG_STATUS.SUCCESS));
                  this.dialogRef.close(this.report);
                } else {
                  this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.SAVE_FILE', MSG_STATUS.FAIL));
                }
              });
            } else {
              this.dialogRef.close(this.report);
            }

            this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_REPORT', MSG_STATUS.SUCCESS));
            this.dialogRef.close(this.report);
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_REPORT', MSG_STATUS.FAIL));
          }
        });
      } else {
        this.reportService.update(this.report).subscribe((response: any) => {
          if (response && response.affected > 0) {
            this.report.updateDate = moment(new Date).format('HH:mm:ss DD/MM/YYYY');
            // Upload file
            if (this.file) {
              this.report.attachFile = this.getFilename(this.report.attachFile);
              this.report.attachFile = this.toNonAccentVietnamese(this.report.attachFile);
              this.reportService.uploadFile(this.report).subscribe((res: any) => {
                if (res.statusCode === 200) {
                  this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_REPORT', MSG_STATUS.SUCCESS));
                  this.dialogRef.close(this.report);
                } else {
                  this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.SAVE_FILE', MSG_STATUS.FAIL));
                }
              });
            } else {
              this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_REPORT', MSG_STATUS.SUCCESS));
              this.dialogRef.close(this.report);
            }
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_REPORT', MSG_STATUS.FAIL));
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
    if (this.report.storeInformation.length === 0) {
      isValidForm = false;
    }

    if (this.report.reportContent.length === 0) {
      isValidForm = false;
    }

    if (!this.districtSelected || this.districtSelected.id === 0) {
      isValidForm = false;
    }

    if (!this.provinceSelected || this.provinceSelected.id === 0) {
      isValidForm = false;
    }

    if (this.report.otherStoreName?.length === 0 && (!this.storeSelected || this.storeSelected.id === 0)) {
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

  onChangeDistrict(event: any) {
    this.agencyList = [];
    this.provinceList = [];
    this.storeDistrictList = [];
    this.getProvinceList();
  }

  onChangeProvince(event: any) {
    this.agencyList = [];
    let agencyIds = this.storeList.filter(x => x.provinceId === event.id);
    agencyIds.forEach(y => {
      const agency = this.agencyListClone.find(i => i.id === y.agencyId);
      if (agency) {
        this.agencyList.push(agency);
      }
    });
    this.agencyList = this.agencyList.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

    if (agencyIds.length === 0) {
      this.showOtherStore = true;
    }
  }

  onChangeAgency(event: any) {
    if (event) {
      this.storeDistrictList = this.storeList.filter(x =>
        x.agencyId === event.id
        && x.provinceId === this.provinceSelected.id
        && x.districtId === this.districtSelected.id);
      this.showOtherStore = false;
    } else {
      this.storeDistrictList = [];
      this.showOtherStore = true;
    }
  }

  onChangeStore(event: any) {
    this.report.storeInformation = this.getStoreInformation(event.id);
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

  getFilename(fullPath: string) {
    return fullPath.replace(/^.*[\\\/]/, '');
  }

  onFileChange(event: any) {
    if (event.target.value) {
      const file = event.target.files[0];
      this.file = file;
      if (this.data) {
        if (this.data.fileName !== file.name) {
          this.report.attachFile = file.name;
        } else {
          this.report.attachFile = this.data.fileName;
        }
      } else {
        this.report.attachFile = file.name;
      }
    };
  }

  private toNonAccentVietnamese(str: string) {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
  }

  private getStoreInformation(id: number) {
    let inform = '';
    const store = this.storeList.find(x => x.id === id);
    if (store) {
      inform = `${store.address}. \nSĐT: ${store.phone}`
    }
    return inform;
  }

  focusNext(id: string) {
    document.getElementById(id)?.focus();
  }

}

