import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BodyComponent } from './body/body.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AgencyComponent } from './agency/agency.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MaterialModule } from './common/material.module';
import { OrderListComponent } from './orders/order-list.component';
import { LoginComponent } from './login/login.component';
import { SublevelMenuComponent } from './sidenav/sublevel-menu.component';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LogoutComponent } from './logout/logout.component';
import { DateAdapter } from '@angular/material/core';
import { DateFormat } from './common/date-format';
import { DialogDetailOrderComponent } from './orders/dialog-detail-order/dialog-detail-order.component';
import { DialogDetailAgencyComponent } from './agency/dialog-detail-agency/dialog-detail-agency.component';
import { DialogDetailProductComponent } from './products/dialog-detail-product/dialog-detail-product.component';
import { DialogConfirmOrderComponent } from './orders/dialog-confirm-order/dialog-confirm-order.component';
import { DialogDeleteConfirmComponent } from './common/dialog-delete-confirm/dialog-delete-confirm.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './common/custom-paginator';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NotifyComponent } from './notify/notify.component';
import { OrderAddComponent } from './orders/order-add/order-add.component';
import { ToastrModule } from 'ngx-toastr';
import { WebReqInterceptor } from './services/web-req.interceptor';
import { HeaderComponent } from './header/header.component';
import { PrintPdfComponent } from './orders/print-pdf/print-pdf.component';
import { NgChartsConfiguration, NgChartsModule } from 'ng2-charts';
import { NgxPrintElementDirective, NgxPrintElementModule } from 'ngx-print-element';
import { DialogDetailNotifyComponent } from './notify/dialog-detail-notify/dialog-detail-notify.component';
import { NgxEditorModule } from 'ngx-editor';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DatePickerFormatDirective } from './common/date-picker-format.directive';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtModule } from '@auth0/angular-jwt';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { DialogChangePasswordComponent } from './header/dialog-change-password/dialog-change-password.component';
import { BnNgIdleService } from 'bn-ng-idle';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { StoresComponent } from './stores/stores.component';
import { DistrictComponent } from './district/district.component';
import { DialogModifyDistrictComponent } from './district/dialog-modify-district/dialog-modify-district.component';

const config: SocketIoConfig = { url: `${environment.apiUrl}`, options: {} };

export function tokenGetter() {
  return localStorage.getItem("accessToken");
}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    BodyComponent,
    DashboardComponent,
    ProductsComponent,
    StatisticsComponent,
    AgencyComponent,
    OrderListComponent,
    OrderAddComponent,
    LoginComponent,
    SublevelMenuComponent,
    PageNotFoundComponent,
    LogoutComponent,
    DialogDetailOrderComponent,
    DialogDetailAgencyComponent,
    DialogDetailProductComponent,
    DialogConfirmOrderComponent,
    DialogDeleteConfirmComponent,
    NotifyComponent,
    HeaderComponent,
    PrintPdfComponent,
    DialogDetailNotifyComponent,
    DatePickerFormatDirective,
    DialogChangePasswordComponent,
    StoresComponent,
    DistrictComponent,
    DialogModifyDistrictComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FontAwesomeModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgChartsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      preventDuplicates: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxPrintElementModule,
    NgxEditorModule,
    MatMomentDateModule,
    MatSnackBarModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [environment.apiUrl]
      }
    }),
    SocketIoModule.forRoot(config),

  ],
  providers: [
    { provide: DateAdapter, useClass: DateFormat },
    { provide: MatPaginatorIntl, useValue: CustomPaginator() },
    { provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true },
    { provide: NgChartsConfiguration, useValue: { generateColors: false } },
    BnNgIdleService,
    NgxPrintElementDirective,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private dateAdapter: DateAdapter<Date>) {
    dateAdapter.setLocale("en-in");
  }
}
