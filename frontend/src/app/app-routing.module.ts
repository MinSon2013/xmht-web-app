import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { OrderListComponent } from './orders/order-list.component';
import { ProductsComponent } from './products/products.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AgencyComponent } from './agency/agency.component';
import { AuthGuardGuard } from './services/guards/auth-guard.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LogoutComponent } from './logout/logout.component';
import { NotifyComponent } from './notify/notify.component';
import { OrderAddComponent } from './orders/order-add/order-add.component';
import { PrintPdfComponent } from './orders/print-pdf/print-pdf.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardGuard] },
  {
    path: 'orders', children: [
      { path: 'list', component: OrderListComponent, canActivate: [AuthGuardGuard] },
      { path: 'add', component: OrderAddComponent, canActivate: [AuthGuardGuard] },
    ]
  },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuardGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuardGuard] },
  { path: 'agency', component: AgencyComponent, canActivate: [AuthGuardGuard] },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthGuardGuard] },
  { path: 'notification', component: NotifyComponent, canActivate: [AuthGuardGuard] },
  { path: 'print', component: PrintPdfComponent, canActivate: [AuthGuardGuard] },
  { path: '**', component: PageNotFoundComponent, canActivate: [AuthGuardGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
