import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Helper } from '../../helpers/helper';
import { MyErrorStateMatcher } from '../../orders/order-add/order-add.component';
import { AGENCY_ROLE, MSG_STATUS, NOTIFY_TYPE, STOCKER_ROLE, USER_SALESMAN_ROLE } from '../../constants/const-data';
import { Notify } from '../../models/notify';
import { NotificationService } from '../../services/notification.service';
import * as moment from 'moment';
import { Editor, toDoc, Toolbar, Validators } from 'ngx-editor';
import { FormControl, FormGroup } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-dialog-detail-notify',
  templateUrl: './dialog-detail-notify.component.html',
  styleUrls: ['./dialog-detail-notify.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogDetailNotifyComponent implements OnInit {
  header: string = '';
  error: any = '';
  matcher = new MyErrorStateMatcher();
  notify: any = {};

  helper = new Helper();
  isAdmin: boolean = new Helper().isAdmin();
  loginId: number = new Helper().getUserId();
  agencyList: any[] = [];
  agencyListSelectOption: any[] = [];
  agencySelected: any = null;
  isEdit: boolean = true;
  userId: number = this.helper.getUserId();
  userRole: number = this.helper.getUserRole();
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;

  editor = new Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  html = '';

  form = new FormGroup({
    editorContent: new FormControl(null, [Validators.required()]),
  });

  couponChecked: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogDetailNotifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Notify,
    public translate: TranslateService,
    private toastr: ToastrService,
    private notifyService: NotificationService,
    private socketService: SocketService,
  ) {
    dialogRef.disableClose = true;
  }

  get doc() {
    return this.form.get('editorContent');
  }

  ngOnInit(): void {
    this.editor = new Editor();
    const jsonDoc = toDoc(this.html);
    if (this.isAdmin) {
      this.form.get('editorContent')?.enable();
    } else {
      this.form.get('editorContent')?.disable();
    }

    this.agencyListSelectOption.push({ id: 0, label: 'Tất cả' });
    this.agencyList = this.helper.getAgencyList();
    this.agencyList.forEach(x => {
      this.agencyListSelectOption.push({ id: x.id, label: x.agencyName });
    });

    if (this.data && this.data.id !== 0) {
      this.translate.get('NOTIFY.TITLE_MODIFIED').subscribe(x => { this.header = x });
      if (!this.isAdmin) {
        this.translate.get('NOTIFY.DETAIL').subscribe(x => { this.header = x });
      }
      this.notify.id = this.data.id;
      this.notify.agencyList = this.data.agencyList;
      this.notify.contents = this.data.contents;
      this.notify.fileName = this.data.fileName;
      this.notify.note = this.data.note;
      this.notify.isPublished = this.data.isPublished;
      this.notify.createdDate = this.data.createdDate;
      this.notify.filePath = this.data.filePath;
      this.notify.mimeType = this.data.mimeType;
      if (this.data.agencyList && this.data.agencyList.length === 1) {
        const id = this.data.agencyList[0];
        const agency = this.agencyListSelectOption.find(x => x.id === id);
        this.agencySelected = agency ? agency : this.agencyListSelectOption[0];
      } else if (this.data.agencyList && this.data.agencyList.length > 1) {
        this.agencySelected = this.agencyListSelectOption[0];
      } else {
        this.agencySelected = this.agencyListSelectOption[0];
      }
      this.notify.agencyId = this.data.agencyId;
      this.html = this.notify.contents;
      this.notify.sender = this.data.sender;
      this.isEdit = (this.notify.sender === this.loginId);
      this.couponChecked = this.data.notificationType === 2 ? true : false
      this.notify.notificationType = this.data.notificationType;
      this.notify.orderId = this.data.orderId;
      this.notify.statusOrder = this.data.statusOrder;
    } else {
      this.notify.id = 0;
      this.notify.agencyList = [];
      this.notify.contents = '';
      this.notify.fileName = '';
      this.notify.note = '';
      this.notify.isPublished = false;
      this.notify.filePath = '';
      this.notify.createdDate = this.helper.getDateFormat(2);
      this.translate.get('NOTIFY.TITLE_ADD').subscribe(x => { this.header = x });
      this.agencySelected = this.agencyListSelectOption[0];
      this.html = '';
      this.notify.isViewed = false;
      this.notify.notificationType = 0;
      this.notify.orderId = 0;
      this.notify.statusOrder = '';
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit(isPublished: boolean) {
    if (this.validForm()) {
      this.notify.isPublished = isPublished;
      this.notify.agencyId = this.agencySelected.id;
      this.notify.sender = this.userId;
      this.notify.userId = this.helper.getUserId();
      this.notify.agencyList = [];
      if (this.notify.agencyId === 0) {
        const res: number[] = [];
        this.agencyList.forEach(x => {
          res.push(x.id);
        });

        this.notify.agencyList = res;
      } else if (this.notify.agencyId === null) {

      } else {
        this.notify.agencyList.push(this.agencySelected.id);
      }

      if (this.notify.id === 0) {
        this.notify.notificationType = this.couponChecked ? NOTIFY_TYPE.COUPON : NOTIFY_TYPE.GENERAL;
        this.notify.orderId = 0;
        this.notify.statusOrder = '';
        this.socketService.createdNotification(this.notify).pipe(
          tap((res) => { })
        ).subscribe((response: any) => {
          if (response) {
            console.log(response.id)
            this.notify.id = response.id;
            if (this.notify.file) {
              this.notify.fileName = this.getFilename(this.notify.fileName);
              this.notify.fileName = this.toNonAccentVietnamese(this.notify.fileName);
              this.notifyService.uploadFile(this.notify).subscribe((res: any) => {
                if (res.statusCode === 200) {
                  this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_NOTIFY', MSG_STATUS.SUCCESS));
                  this.dialogRef.close(this.notify);
                } else {
                  this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.SAVE_FILE', MSG_STATUS.FAIL));
                }
              });
            } else {
              this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_NOTIFY', MSG_STATUS.SUCCESS));
              this.dialogRef.close(this.notify);
            }
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.ADD_NOTIFY', MSG_STATUS.FAIL));
          }
        });
      } else {
        if (this.userId === this.notify.sender) {
          this.notify.isViewed = true;
        } else {
          this.notify.isViewed = false;
        }
        this.socketService.updatedNotification(this.notify).pipe(
          tap((res) => { })
        ).subscribe((response: any) => {
          if (response && response.affected > 0) {
            if (this.notify.file) {
              this.notify.fileName = this.getFilename(this.notify.fileName);
              this.notify.fileName = this.toNonAccentVietnamese(this.notify.fileName);
              this.notifyService.uploadFile(this.notify).subscribe((res: any) => {
                if (res.statusCode === 200) {
                  this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_NOTIFY', MSG_STATUS.SUCCESS));
                  this.dialogRef.close(this.notify);
                } else {
                  this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.SAVE_FILE', MSG_STATUS.FAIL));
                }
              });
            } else {
              this.helper.showSuccess(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_NOTIFY', MSG_STATUS.SUCCESS));
              this.dialogRef.close(this.notify);
            }
          } else {
            this.helper.showError(this.toastr, this.helper.getMessage(this.translate, 'MESSAGE.MODIFIED_NOTIFY', MSG_STATUS.FAIL));
          }
        });
      }
    }
  }

  onCancel() {
    if (this.notify.id !== 0) {
      if (this.userId === this.notify.sender) {
        const payload = {
          isViewed: true,
          agencyId: this.notify.agencyId,
          notificationId: this.notify.id,
        }
        this.socketService.changeStatusNotify(payload);
      }
    }
    this.dialogRef.close(null);
  }

  validForm(): boolean {
    let isValidForm: boolean = true;
    if (this.notify.contents.length === 0) {
      isValidForm = false;
    }
    // if (this.notify.fileName.length === 0) {
    //   isValidForm = false;
    // }

    if (!isValidForm) {
      this.error = 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)';
    }
    return isValidForm;
  }

  onSelected(event: any) {
    if (event === 0) {
      this.notify.agencyId = 0;
    } else {
      this.notify.agencyId = event.id;
    }
  }

  getFilename(fullPath: string) {
    return fullPath.replace(/^.*[\\\/]/, '');
  }

  onFileChange(event: any) {
    if (event.target.value) {
      const file = event.target.files[0];
      this.notify.file = file;
      if (this.data) {
        if (this.data.fileName !== file.name) {
          this.notify.fileName = file.name;
        } else {
          this.notify.fileName = this.data.fileName;
        }
      } else {
        this.notify.fileName = file.name;
      }
    };
  }

  onChange(html: object) {
    this.notify.contents = html;
  }

  onKeyup(obj: any) { }

  onChangeCheckbox(event: any) {
    this.couponChecked = event.checked;
  }

  private convertToPlain(html: string) {
    let tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }

  private toLowerCaseNonAccentVietnamese(str: string) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
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

}

