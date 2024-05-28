import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { AGENCY_ROLE, NOTIFY_TYPE, SERVICE_TYPE, STOCKER_ROLE, USER_AREA_MANAGER_ROLE, USER_SALESMAN_ROLE } from '../constants/const-data';
import { Helper } from '../helpers/helper';
import { DialogDetailNotifyComponent } from './dialog-detail-notify/dialog-detail-notify.component';
import { Notify } from '../models/notify';
import { NotificationService } from '../services/notification.service';
import { Agency } from '../models/agency';
import { SocketService } from '../services/socket.service';
import { RoutesService } from '../services/routes.service';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.scss']
})
export class NotifyComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['checkAll', 'updatedDate', 'agencyName', 'contents', 'fileName', 'statusOrder', 'confirmer', 'action'];
  dataSource = new MatTableDataSource<Notify>();
  dataSourceClone = new MatTableDataSource<Notify>();
  dataElement: Notify[] = [];
  colspan: number = 0;

  helper = new Helper();
  isAdmin: boolean = new Helper().isAdmin();
  loginId: number = new Helper().getUserId();
  hasData: boolean = false;
  agencyList: Agency[] = [];
  agencyId: number = 0;
  checkedAll: boolean = false;

  arrDelete: number[] = [];
  MAX_LENGTH_SHORT_CONTENT: number = 50;

  isBadgeHidden1: boolean = true;
  isBadgeHidden2: boolean = true;
  badgeNumber1: number = 0;
  badgeNumber2: number = 0;

  userRole: number = this.helper.getUserRole();
  isStocker: boolean = this.userRole === STOCKER_ROLE;
  isAgency: boolean = this.userRole === AGENCY_ROLE;
  isAreaManager: boolean = this.userRole === USER_AREA_MANAGER_ROLE;
  isSalesman: boolean = this.userRole === USER_SALESMAN_ROLE;

  // Binding total items count to paginator Mat table
  mpPaginator: MatPaginator | undefined;
  // Set paginator using dynamic data from Api
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.mpPaginator = value;
      this.dataSource.paginator = this.paginator;
    }
  }

  // Set sort using dynamic data from Api
  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = value;
    }
  }

  totalItems: number = 0;
  pageSize: number = 10;
  skip: number = 0;
  takeLimitQuery: number = 100;
  pageIndex: number = 0;

  constructor(public dialog: MatDialog,
    public notifyService: NotificationService,
    private socketService: SocketService,
    private routesService: RoutesService,
  ) { this.getAgencys(); }

  ngOnInit(): void {
    this.agencyId = this.helper.getAgencyId();
    if (!this.isAdmin && !this.isSalesman) {
      this.displayedColumns = ['checkAll', 'updatedDate', 'agencyName', 'contents', 'fileName', 'statusOrder', 'confirmer'];
    }
    if (this.isAgency) {
      this.displayedColumns = ['checkAll', 'updatedDate', 'contents', 'fileName', 'statusOrder', 'confirmer', 'action'];
    }
    this.colspan = this.displayedColumns.length;
    this.getNotifyList();
    this.emitSocket();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void { }

  getNotifyList() {
    this.totalItems = 0;
    this.skip = 0;
    this.pageIndex = 0;
    this.dataElement = [];

    this.notifyService.getNotificationList(this.takeLimitQuery, this.skip).subscribe((response: any) => {
      this.generalResponseToDataSource(response, this.pageIndex);
    });
  }

  generalResponseToDataSource(response: any, pageIndex: number) {
    this.totalItems = response.totalCount;
    const notifyAgencyList = response.notifyAgencyList.length > 0 ? response.notifyAgencyList : [];
    if (response.notifyList.length > 0) {
      response.notifyList.forEach((el: any) => {
        el.showContent = this.convertHtmlToText(el.contents);
        if (el.showContent.length > this.MAX_LENGTH_SHORT_CONTENT) {
          el.showContent = el.showContent.substring(0, (this.MAX_LENGTH_SHORT_CONTENT - 1));
          el.showLabel = "...[Chi tiết]";
          el.showDetail = false;
        }

        if (el.agencyList && el.agencyList?.length === 1) {
          let agencyId = el.agencyList[0];
          const item = this.agencyList.find(x => x.id === agencyId);
          if (item) {
            el.agencyName = item.agencyName;
          } else {
            el.agencyName = '';
          }
        } else if (el.agencyList && el.agencyList?.length > 1) {
          el.agencyName = "Tất cả"
        }
        if (el.sender === this.loginId) { // sender is userId, loginId is userId
          el.isViewed = true;
        } else {
          const item = notifyAgencyList.find((x: { notificationId: number; agencyId: number; isViewed: boolean }) => x.notificationId === el.id && x.agencyId === this.agencyId);
          if (item) {
            el.isViewed = item.isViewed;
            el.agencyId = item.agencyId;
          }
        }

        if (el.notificationType === NOTIFY_TYPE.COUPON && !el.isViewed) {
          this.badgeNumber2 = this.badgeNumber2 + 1;
          this.isBadgeHidden2 = false;
        }
        if (el.notificationType === NOTIFY_TYPE.GENERAL && !el.isViewed) {
          this.badgeNumber1 = this.badgeNumber1 + 1;
          this.isBadgeHidden1 = false;
        }
      });
      this.dataElement = [...this.dataElement, ...response.notifyList];
    } else {
      if (pageIndex === 0) {
        this.dataElement = [];
      }
    }

    this.dataSourceClone = new MatTableDataSource<Notify>(this.dataElement);
    this.dataSource = new MatTableDataSource(this.claimDataSource(pageIndex));

    if (this.dataSource.data.length === 0) {
      this.hasData = false;
    } else {
      this.hasData = true;
    }
  }

  getAgencys() {
    this.routesService.getAgencyList().subscribe((response: any) => {
      this.agencyList = response;
    });
  }

  private convertHtmlToText(html: string) {
    let text = html.replaceAll("<p>", "");
    text = text.replaceAll("</p>", "\n");
    text = text.replace(/<\/?[^>]+(>|$)/g, "")
    return text;
  }

  onLoadNotify(key: number) {
    switch (key) {
      case 1:
        this.getNotifyList();
        break;
      case 2:
        const arr1 = this.dataSourceClone.data.filter(x => x.notificationType === NOTIFY_TYPE.COUPON);
        this.dataSource.data = arr1;
        this.isBadgeHidden2 = true;
        break;
    }

    if (this.dataSource.data.length === 0) {
      this.hasData = false;
    } else {
      this.hasData = true;
    }
  }

  emitSocket() {
    this.socketService.socketOnNotifyCRUD().subscribe((response: any) => {
      this.getNotifyList();
    })
  }

  onEdit(row: any) {
    const elements = Array.from(
      document.getElementsByClassName('body') as HTMLCollectionOf<HTMLElement>,
    );
    const dialogRef = this.dialog.open(DialogDetailNotifyComponent, {
      data: {
        row,
        agencyList: this.agencyList,
        disableClose: true,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getNotifyList();
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.NOTIFYSERVICE, content: 'Bạn chắc chắn muốn xóa thông báo này?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.dataElement = this.dataElement.filter(x => x.id !== row.id);
        this.dataSourceClone = new MatTableDataSource<Notify>(this.dataElement);
        this.dataSource = new MatTableDataSource(this.claimDataSource(this.pageIndex));

        if (this.dataSource.data.length === 0) {
          this.hasData = false;
        } else {
          this.hasData = true;
        }
      }
    });
  }

  truncate(str: string, length: number) {
    return (str.length > length) ? str.slice(0, length - 1) + ' [...]' : str;
  };

  onDownload(row: any) {
    if (row.fileName.length !== 0) {
      this.notifyService.downloadFile(row.id);
    }
  }

  onChangeCheckedAll(event: any) {
    this.checkedAll = event.checked;
    if (event.checked) {
      this.dataSource.data.forEach(x => {
        x.checkedItem = true;
        this.arrDelete.push(x.id);
      });
    } else {
      this.dataSource.data.forEach(x => {
        x.checkedItem = false;
      });
      this.arrDelete = [];
    }

  }

  onChangeCheckedItem(event: any, element: any) {
    element.checkedItem = event.checked;
    if (event.checked) {
      this.arrDelete.push(element.id);
      if (this.arrDelete.length === this.dataSource.data.length) {
        this.checkedAll = true;
      } else {
        this.checkedAll = false;
      }
    } else {
      this.arrDelete = this.arrDelete.filter(x => x !== element.id);
      if (this.checkedAll) {
        this.checkedAll = false;
      }
    }
  }

  showDetail(element: any) {
    element.showContent = this.convertHtmlToText(element.contents);
    if (element.showDetail) {
      if (element.showContent.length > this.MAX_LENGTH_SHORT_CONTENT) {
        element.showLabel = "...[Chi tiết]";
        element.showDetail = false;
        element.showContent = element.showContent.substring(0, (this.MAX_LENGTH_SHORT_CONTENT - 1));
      }
    } else {
      element.showLabel = "[Ẩn bớt]";
      element.showDetail = true;
    }
  }

  onDeleteAll() {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { arrDelete: this.arrDelete, type: SERVICE_TYPE.NOTIFYSERVICE, content: 'Bạn chắc chắn muốn xóa tất cả thông báo?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getNotifyList();
        this.checkedAll = false;
        this.arrDelete = [];
      }
    });
  }

  changePaging(event: any) {
    this.pageSize = event.pageSize;
    let itemIndex = (event.pageIndex + 1) * event.pageSize;
    if (itemIndex <= this.dataElement.length) {
      this.dataSource = new MatTableDataSource(this.claimDataSource(event.pageIndex));
    } else {
      this.skip += 1; this.skip += 1;
      this.onLazyLoadCallAPI(event.pageIndex);
    }
  }

  claimDataSource(pageIndex: number) {
    return this.dataElement.slice(pageIndex * this.pageSize, (pageIndex + 1) * this.pageSize)
  }

  onLazyLoadCallAPI(pageIndex: number) {
    this.notifyService.getNotificationList(this.takeLimitQuery, this.skip).subscribe((response) => {
      this.generalResponseToDataSource(response, pageIndex);
    })
  }

}

