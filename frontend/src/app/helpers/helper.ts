import { animate, style, transition, trigger, keyframes } from "@angular/animations";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { CONFIG } from "../common/config";
import { LoginInfo } from "../models/login-info";
import jwt_decode from "jwt-decode";
import { ADMIN_ROLE, AGENCY_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from "../constants/const-data";
import * as moment from "moment";

export interface INavbarData {
  routeLink: string;
  icon?: string;
  label: string,
  expanded?: boolean;
  items?: INavbarData[];
}

export interface ICity {
  value: number;
  label: string;
}

export interface ITransport {
  value: number;
  label: string;
}

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('350ms',
      style({ opacity: 1 })
    )
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('350ms',
      style({ opacity: 0 })
    )
  ])
])

export const rotate = trigger('rotate', [
  transition(':enter', [
    animate('1000ms',
      keyframes([
        style({ transform: 'rotate(0deg)', offset: '0' }),
        style({ transform: 'rotate(2turn)', offset: '1' })
      ])
    )
  ])
])

export class Helper {

  isExpireToken() {
    const token = localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN);
    if (token) {
      const now = new Date();
      const decode: any = jwt_decode(token!);
      const expireDate = new Date(decode.exp * 1000);
      if (expireDate >= now) {
        return true;
      }
    }
    this.clearSession();
    return false;
  }

  checkSession() {
    let appHeader = document.getElementById('app-header');
    let appLogin = document.getElementById('login-container');
    if (localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN)) {
      appHeader ? appHeader.hidden = false : '';
      appLogin ? appLogin.hidden = true : '';
      return true;
    } else {
      appHeader ? appHeader.hidden = true : '';
      appLogin ? appLogin.hidden = false : '';
      return false;
    }
  }

  getAccessToken() {
    const token = localStorage.getItem(CONFIG.LOCAL_STORAGE.ACCESS_TOKEN);
    if (token) {
      return token;
    }
    return '';
  }

  clearSession() {
    localStorage.clear();
  }

  isAdmin(): boolean {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      if (!json.isAdmin) {
        return false;
      }
    }
    return true;
  }

  getFullName(): string {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return json.fullName;
    }
    return '';
  }

  getUserId(): number {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return Number(json.userId);
    }
    return 0;
  }

  getAgencyId(): number {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return Number(json.agencyId);
    }
    return 0;
  }

  getAgencyName(): string {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return json.agencyName;
    }
    return '';
  }

  getUserRole() {
    const info = localStorage.getItem(CONFIG.LOCAL_STORAGE.LOGIN_INFO);
    if (info) {
      const json = JSON.parse(info) as LoginInfo;
      return Number(json.userRole);
    }
    return 0;
  }

  getMessage(translate: TranslateService, key: string, status: number, content?: string): string {
    let msg: string = '';
    if (status === 1) {
      translate.get(key).subscribe(x => {
        msg = x + " thành công";
      });
    } else if (status === 2) {
      translate.get(key).subscribe(x => {
        msg = x + " xảy ra lỗi";
      });
    } else {
      translate.get(key).subscribe(x => {
        msg = x;
      });
    }
    return msg;
  }

  showSuccess(toastr: ToastrService, msg: string, title?: string) {
    toastr.success(msg);
  }

  showError(toastr: ToastrService, msg: string, title?: string) {
    toastr.error(msg);
  }

  showWarning(toastr: ToastrService, msg: string, title?: string) {
    toastr.warning(msg);
  }

  public isKeyPressedNumeric(event: any, inputVal: any): boolean {
    let input = inputVal.value;
    input = input + event.key;
    if (input.length >= 2) {
      var txtVal = input;
      return !!/^\d*\.?\d{0,18}$/.test(txtVal);
    }

    const charCode = this.getCharCode(event);
    const charStr = event.key ? event.key : String.fromCharCode(charCode);
    return this.isCharNumeric(charStr);
  }

  private getCharCode(event: any): any {
    event = event || window.event;
    return (typeof event.which == "undefined") ? event.keyCode : event.which;
  }

  private isCharNumeric(charStr: any): boolean {
    let validation = false;
    if (charStr == ".") {
      return validation;
    } else {
      validation = !!/\d/.test(charStr);
    }
    return validation;
  }

  public onlyNumberKey(event: any) {
    var ASCIICode = (event.which) ? event.which : event.keyCode;
    if (ASCIICode > 31
      && (ASCIICode < 48 || ASCIICode > 57)
      && (ASCIICode < 96 || ASCIICode > 105)
      && ASCIICode !== 110
      && ASCIICode !== 190) {
      return false;
    }
    return true;
  }

  public getRoleAllowed(k: number) {
    let role: number[] = [];
    switch (k) {
      case 1:
        role = [ADMIN_ROLE];
        break;
      case 2:
        role = [ADMIN_ROLE, STOCKER_ROLE];
        break;
      case 3:
        role = [ADMIN_ROLE, USER_AREA_MANAGER_ROLE];
        break;
      case 4:
        role = [ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE];
        break;
      default:
        role = [ADMIN_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE, AGENCY_ROLE];
    }

    return role;
  }

  public getDateFormat(t: number, value?: Date | null): string {
    const UPDATE_DATE_FORMAT_1 = 'HH:mm:ss DD/MM/YYYY';
    const UPDATE_DATE_FORMAT_2 = 'HH:mm DD/MM/YYYY';
    const UPDATE_DATE_FORMAT_3 = 'DD/MM/YYYY';
    if (t === 1) {
      return moment(new Date).format(UPDATE_DATE_FORMAT_1);
    } else if (t === 2) {
      return moment(new Date).format(UPDATE_DATE_FORMAT_2);
    } else if (t === 3) {
      return moment(value).format(UPDATE_DATE_FORMAT_3);
    } else if (t === 4) {
      return moment().format('HH giờ mm"');
    } else {
      return '';
    }
  }

}

