import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { fadeInOut, Helper, INavbarData, rotate } from '../helpers/helper';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    fadeInOut,
    rotate,
  ]
})
export class SidenavComponent implements OnInit, AfterViewInit {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData: INavbarData[] = [];

  multiple: boolean = false;
  isSuccess: boolean = false;

  isAdmin: boolean = new Helper().isAdmin();
  helper = new Helper();

  @HostListener('window: resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
    }
  }

  constructor(public router: Router, private route: ActivatedRoute,
    private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.route.params.subscribe((params: Params) => this.isSuccess = params['caller']);
    this.toggleCollapsed(); // set narba show after login
  }

  public ngAfterViewInit() {
    this.navData = this.helper.getMenuList();
    this.cd.detectChanges();
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded;
  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : '';
  }

  shrinkItems(item: INavbarData): void {
    /* Luon expanded sub-menu, khong trigger hidden khi click menu khac  */
    // if (!this.multiple) {
    //   for (let modelItem of this.navData) {
    //     if (item !== modelItem && modelItem.expanded) {
    //       modelItem.expanded = false;
    //     }
    //   }
    // }
  }
}

