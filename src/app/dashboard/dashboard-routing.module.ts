import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { ExitDashGuard } from '../shared/guards/exit-dash.guard';
import { AccAddressesComponent } from './dash-account/acc-addresses/acc-addresses.component';
import { AccNotifsComponent } from './dash-account/acc-notifs/acc-notifs.component';
import { AccOrdersComponent } from './dash-account/acc-orders/acc-orders.component';
import { AccProfileComponent } from './dash-account/acc-profile/acc-profile.component';
import { AccTicketsComponent } from './dash-account/acc-tickets/acc-tickets.component';
import { DashAccountComponent } from './dash-account/dash-account.component';
import { DashFreestyleComponent } from './dash-freestyle/dash-freestyle.component';
import { DashHomeComponent } from './dash-home/dash-home.component';
import { DashPremiumComponent } from './dash-premium/dash-premium.component';
import { DashTeamManagComponent } from './dash-team-manag/dash-team-manag.component';
import { DashboardComponent } from './dashboard.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    ...canActivate(redirectUnauthorizedToLogin),
    canDeactivate: [ExitDashGuard],
    children: [
      { path: 'home', component: DashHomeComponent },
      { path: 'team-management', component: DashTeamManagComponent },
      { path: 'freestyle', component: DashFreestyleComponent },
      { path: 'premium', component: DashPremiumComponent },
      {
        path: 'account',
        component: DashAccountComponent,
        children: [
          { path: 'profile', component: AccProfileComponent },
          { path: 'notifications', component: AccNotifsComponent },
          { path: 'addresses', component: AccAddressesComponent },
          { path: 'orders', component: AccOrdersComponent },
          { path: 'tickets', component: AccTicketsComponent },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
