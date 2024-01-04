import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Helper } from '../helpers/helper';
import { NotificationService } from '../services/notification.service';
import { SocketService } from '../services/socket.service';
import { CustomSocket } from '../sockets/custom-socket';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangePasswordComponent } from './dialog-change-password/dialog-change-password.component';
import { AGENCY_ROLE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../constants/const-data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @ViewChild('subMenuTrigger') subMenuTrigger!: MatMenuTrigger;
  @ViewChild('menuTrigger1') menuTrigger1!: MatMenuTrigger;
  @ViewChild('menuTrigger2') menuTrigger2!: MatMenuTrigger;

  helper = new Helper();
  agencyName: string = '';
  isBadgeHidden: boolean = true;
  badgeNumber: number = 0;
  agencyId: number = this.helper.getAgencyId();
  isAdmin: boolean = this.helper.isAdmin();
  userRole: number = this.helper.getUserRole();
  navigateComponent: string = 'logout';
  allowedRole = this.helper.getRoleAllowed(4);
  hidden: boolean = !this.isAdmin && !this.allowedRole.includes(this.userRole);
  isStocker: boolean = this.userRole === STOCKER_ROLE;
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;

  constructor(private router: Router,
    public notifyService: NotificationService,
    private socketService: SocketService,
    private socket: CustomSocket,
    public translate: TranslateService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.isAgency) {
      this.agencyName = this.helper.getAgencyName();
    } else {
      this.agencyName = this.helper.getFullName();
    }

    this.getBadgeNumber();
    this.emitSocket();
  }

  ngAfterViewInit() { }

  getBadgeNumber() {
    this.notifyService.getBadgeNumber(this.agencyId)
      .pipe()
      .subscribe(response => {
        this.badgeNumber = 0;
        if (this.helper.isAdmin()) {
          response.forEach((el: { count: number; agencyId: number }) => {
            if (el.agencyId === this.helper.getAgencyId()) {
              this.badgeNumber += Number(el.count);
            }
          });
        } else {
          this.badgeNumber = response.length !== 0 ? Number(response[0].count) : 0;
        }

        if (this.badgeNumber === 0) {
          this.isBadgeHidden = true;
        } else {
          this.isBadgeHidden = false;
        }
      });
  }

  emitSocket() {
    this.socket.on('emitBadgeNumber', (response: { count: number; agencyId: number }[]) => {
      this.getBadgeNumber();
    });
  }

  onClick() {
    this.router.navigateByUrl('notification');
  }

  onRouterLink(key: string) {
    this.router.navigateByUrl(key);
  }

  openSubMenu(submenu: MatMenuTrigger, key: number) {
    submenu.openMenu();
    if (key === 1) {
      this.closeSubMenu(this.menuTrigger2);
    }
    if (key === 2) {
      this.closeSubMenu(this.menuTrigger1);
    }
  }

  closeSubMenu(submenu: MatMenuTrigger) {
    submenu.closeMenu();
  }

  onLogOut() {
    this.router.navigate([this.navigateComponent]);
  }

  onChangePassword() {
    const dialogRef = this.dialog.open(DialogChangePasswordComponent, {
      data: { userId: this.helper.getUserId() },
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
