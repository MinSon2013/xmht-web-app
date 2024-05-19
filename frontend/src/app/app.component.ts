import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { Helper } from './helpers/helper';
import { LoginService } from './services/login.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { DisplayService } from './services/display.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;
  helper = new Helper();
  location!: Location;
  showNavigation = true;
  private destroyed: Subject<void> = new Subject<void>();

  constructor(public translate: TranslateService,
    public loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private bnIdle: BnNgIdleService,
    private displayService: DisplayService,
  ) {
    translate.setDefaultLang('i18n');
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
        window.location.reload();
      }
    });

    this.displayService.showNavigation$
      .pipe(takeUntil(this.destroyed))
      .subscribe((visible: boolean) => {
        this.showNavigation = visible;
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
}
