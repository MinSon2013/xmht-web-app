import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogDeleteConfirmComponent } from '../common/dialog-delete-confirm/dialog-delete-confirm.component';
import { NOTIFY_TYPE, SERVICE_TYPE } from '../constants/const-data';
import { Helper } from '../helpers/helper';
import { DialogDetailNotifyComponent } from './dialog-detail-notify/dialog-detail-notify.component';
import { Notify } from '../models/notify';
import { NotificationService } from '../services/notification.service';
import { Agency } from '../models/agency';
import { SocketService } from '../services/socket.service';
import { CustomSocket } from '../sockets/custom-socket';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.scss']
})
export class NotifyComponent implements OnInit {

  displayedColumns: string[] = ['updatedDate', 'agencyName', 'contents', 'statusOrder', 'deleteAction'];
  dataSource = new MatTableDataSource<Notify>();
  dataSourceClone = new MatTableDataSource<Notify>();
  colspan: number = 0;

  helper = new Helper();
  isAdmin: boolean = new Helper().isAdmin();
  loginId: number = new Helper().getAgencyId();
  hasData: boolean = false;
  agencyList: Agency[] = [];
  agencyId: number = 0;
  checkedAll: boolean = false;
  isStocker: boolean = this.helper.isStocker();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog,
    public notifyService: NotificationService,
    private socketService: SocketService,
    private socket: CustomSocket,
  ) { }

  ngOnInit(): void {
    this.agencyId = this.helper.getAgencyId();
    if (!this.isAdmin) {
      this.displayedColumns = ['updatedDate', 'agencyName', 'contents', 'statusOrder', 'deleteAction'];
    }
    this.colspan = this.displayedColumns.length;
    this.agencyList = this.helper.getAgencyList();
    this.getData();
    this.emitSocket();
  }

  getData() {
    this.notifyService.getNotificationList().subscribe((response: any) => {
      const notifyAgencyList = response.notifyAgencyList.length > 0 ? response.notifyAgencyList : [];
      if (response.notifyList.length > 0) {
        this.dataSource.data = response.notifyList.length > 0 ? response.notifyList : [];
        this.dataSource.data.forEach(el => {
          if (el.shortContents.length > 50) {
            el.shortContents = el.shortContents + ' [...]';
          }
          if (el.agencyList && el.agencyList?.length === 1) {
            let agencyId = el.agencyList[0];
            if (this.isAdmin) {
              if (agencyId === this.agencyId) {
                agencyId = el.sender;
              }
            }
            const item = this.agencyList.find(x => x.id === agencyId);
            if (item) {
              el.agencyName = item.fullName;
            } else {
              el.agencyName = '';
            }
          } else if (el.agencyList && el.agencyList?.length > 1) {
            el.agencyName = "Tất cả"
          }

          if (el.sender === this.agencyId) {
            el.isViewed = true;
          } else {
            const item = notifyAgencyList.find((x: { notificationId: number; agencyId: number; isViewed: boolean }) => x.notificationId === el.id && x.agencyId === this.agencyId);
            if (item) {
              el.isViewed = item.isViewed;
              el.agencyId = item.agencyId;
            }
          }
        });
      } else {
        this.dataSource.data = [];
      }

      this.dataSourceClone = new MatTableDataSource<Notify>(this.dataSource.data);
      if (this.dataSource.data.length === 0) {
        this.hasData = false;
      } else {
        this.hasData = true;
      }
    });
  }

  onLoadNotify(key: number) {
    switch (key) {
      case 1:
        this.getData();
        break;
      case 2:
        const arr1 = this.dataSourceClone.data.filter(x => x.notificationType === NOTIFY_TYPE.COUPON);
        this.dataSource.data = arr1;
        break;
      case 3:
        const arr2 = this.dataSourceClone.data.filter(x => x.isViewed !== true);
        this.dataSource.data = arr2;
        break;
    }

    if (this.dataSource.data.length === 0) {
      this.hasData = false;
    } else {
      this.hasData = true;
    }
  }

  emitSocket() {
    this.socket.on('emitNotifyList', (response: any) => {
      this.getData();
    })
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onEdit(row: any) {
    const elements = Array.from(
      document.getElementsByClassName('body') as HTMLCollectionOf<HTMLElement>,
    );
    const dialogRef = this.dialog.open(DialogDetailNotifyComponent, {
      data: row,
    });

    elements.forEach(el => {
      el.style.position = 'fixed';
    });

    dialogRef.afterClosed().subscribe(result => {
      elements.forEach(el => {
        el.style.position = 'relative';
      });
      this.getData();
      if (result !== null) {
        if (row && row.id !== 0) {
          row.contents = result.contents ? result.contents : '';
          row.fileName = result.fileName;
          row.fileBlob = result.fileBlob;
          row.note = result.note;
          row.isPublished = result.isPublished;
          row.createdDate = result.createdDate;
          row.agencyList = result.agencyList;
          row.mimeType = result.mimeType;
          row.filePath = result.filePath;
          row.isViewd = result.isViewd;
        } else {
          this.dataSource.data = [result, ...this.dataSource.data];
          this.dataSource.data = this.dataSource.data;
        }
      }
    });
  }

  onDelete(row: any) {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: row.id, type: SERVICE_TYPE.NOTIFYSERVICE, content: 'Bạn chắc chắn muốn xóa thông báo này?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(x => x.id !== row.id);
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
    this.notifyService.downloadFile(row.id)
    // .pipe(tap((res1) => {
    // })).subscribe((res: any) => {
    //   if (res.statusCode === 400) {
    //     console.log(res)
    //   }
    // });
  }

  onChangeCheckedAll(event: any) {
    this.checkedAll = event.checked;
  }

  onDeleteAll() {
    const dialogRef = this.dialog.open(DialogDeleteConfirmComponent, {
      data: { id: 0, type: SERVICE_TYPE.NOTIFYSERVICE, content: 'Bạn chắc chắn muốn xóa tất cả thông báo?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data = [];
        this.hasData = false;
      }
    });
  }

}

