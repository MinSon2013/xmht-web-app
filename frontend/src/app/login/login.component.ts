import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap, timeout } from 'rxjs';
import { Helper } from '../helpers/helper';
import { LoginService } from '../services/login.service';
import { SocketService } from '../services/socket.service';
import { CONFIG } from '../common/config';
import { CustomSocket } from '../sockets/custom-socket';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  readonly routingOrderList = CONFIG.APP_ROUTING.ORDER.ORDERS + CONFIG.APP_ROUTING.ORDER.LIST;
  username: string = ''; // administrator
  password: string = ''; // administrator
  isUsernameValid: boolean = true;
  isPasswordValid: boolean = true;
  error: string = '';
  helper: Helper = new Helper();

  constructor(private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    if (this.helper.isExpireToken()) {
      if (this.helper.checkSession()) {
        this.router.navigate([this.routingOrderList]);
      }
    }
  }

  ngAfterViewInit() {
    this.helper.checkSession();
  }

  ngOnDestroy(): void { }

  validationUsername(): boolean {
    let pattern = RegExp(/^[\w~.]*$/);
    if (pattern.test(this.username)) {
      this.isUsernameValid = true;
      return true;
    } else {
      pattern = RegExp(/^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i);
      if (pattern.test(this.username)) {
        this.isUsernameValid = true;
        return true;
      }
    }
    this.error = 'Tên đăng nhập không thể chứa kí tự đặc biệt.';
    this.isUsernameValid = false;
    return false;
  }

  validationPassword(): boolean {
    if (this.password.length === 0) {
      this.isPasswordValid = false;
      this.error = 'Tên đăng nhập hoặc mật khẩu không đúng.';
      return false;
    }
    this.isPasswordValid = true;
    return true;
  }

  onKey(event: any, type: string) {
    this.error = '';
    if (type === 'username') {
      this.username = event.target.value;
    } else if (type === 'password') {
      this.password = event.target.value;
    }
  }

  onSubmit() {
    if (this.validationUsername() && this.validationPassword()) {
      this.loginService.login(this.username.trim(), this.password.trim())
        .pipe(
          tap()
        ).subscribe(() => {
          window.location.reload();
          setTimeout(() => {
            this.router.navigate([this.routingOrderList]);
          }, 5000);
        });
    } else {
      this.error = 'Tên đăng nhập hoặc mật khẩu không đúng.';
      this.helper.showError(this.toastr, this.error);
    }
  }

  focusNext(id: string) {
    document.getElementById(id)?.focus();
  }

}
