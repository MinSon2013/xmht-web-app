import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { Helper } from './helpers/helper';
import { LoginService } from './services/login.service';
import { BnNgIdleService } from 'bn-ng-idle';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isSideNavCollapsed = false;
  screenWidth = 0;
  isAuthenticated: boolean = false;
  helper = new Helper();
  location!: Location;

  constructor(public translate: TranslateService,
    public loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private bnIdle: BnNgIdleService) {
    translate.setDefaultLang('i18n');
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }

  ngOnInit() {
    this.helper.checkSession();
    if (environment.production) {
      if (this.location.protocol === 'http:') {
        window.location.href = this.location.href.replace('http', 'https');
      }
    }

    this.bnIdle.startWatching(600).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        //console.log('session expired');
        window.location.reload();
      }
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
}
