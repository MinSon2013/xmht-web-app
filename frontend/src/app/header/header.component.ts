import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Helper } from '../helpers/helper';
import { NotificationService } from '../services/notification.service';
import { SocketService } from '../services/socket.service';
import { CustomSocket } from '../sockets/custom-socket';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangePasswordComponent } from './dialog-change-password/dialog-change-password.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @Input() collapsed = false;
  @Input() screenWidth = 0;
  @ViewChild('clickMenuTrigger') clickMenuTrigger!: MatMenuTrigger;

  helper = new Helper();
  agency: string = '';
  isBadgeHidden: boolean = true;
  badgeNumber: number = 0;
  agencyId: number = this.helper.getAgencyId();
  isAdmin: boolean = this.helper.isAdmin();
  navigateComponent: string = 'logout';

  constructor(private router: Router,
    public notifyService: NotificationService,
    private socketService: SocketService,
    private socket: CustomSocket,
    public translate: TranslateService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.agency = this.helper.getInfoName();
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

  getHeadClass(): string {
    let styleClass = '';
    if (this.collapsed && this.screenWidth > 768) {
      styleClass = 'head-trimmed';
    } else if (this.collapsed
      && this.screenWidth <= 768
      && this.screenWidth > 0) {
      styleClass = 'head-md-screen';
    }
    return styleClass;
  }

  onClick() {
    this.router.navigateByUrl('notification');
  }

  openHeaderMenu() {
    if (!this.isAdmin) {
      this.clickMenuTrigger.openMenu();
    }
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
