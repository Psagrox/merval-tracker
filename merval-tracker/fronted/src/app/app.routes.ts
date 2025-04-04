import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { StockDetailComponent } from './components/stocks/stock-detail/stock-detail.component';
import { StockFormComponent } from './components/stocks/stock-form/stock-form.component';
import { TransactionListComponent } from './components/transactions/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './components/transactions/transaction-form/transaction-form.component';
import { PortfolioSummaryComponent } from './components/portfolio/portfolio-summary/portfolio-summary.component';
import { PortfolioSettingsComponent } from './components/portfolio/portfolio-settings/portfolio-settings.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'portfolio',
    canActivate: [authGuard],
    children: [
      { path: '', component: PortfolioSummaryComponent},
      { path: 'settings', component: PortfolioSettingsComponent }
    ]
  },
  {
    path: 'stocks',
    canActivate: [authGuard],
    children: [
      { path: '', component: StockListComponent },
      { path: 'new', component: StockFormComponent },
      { path: ':id', component: StockDetailComponent },
      { path: ':id/edit', component: StockFormComponent }
    ]
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    children: [
      { path: '', component: TransactionListComponent },
      { path: 'new', component: TransactionFormComponent },
      { path: ':id', component: TransactionFormComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard'}
];

export class AppRoutingModule { }

