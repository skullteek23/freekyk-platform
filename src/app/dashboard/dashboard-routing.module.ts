import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { ExitDashGuard } from '../shared/guards/exit-dash.guard';
import { AccAddressesComponent } from './dash-account/acc-addresses/acc-addresses.component';
import { AccNotifsComponent } from './dash-account/acc-notifs/acc-notifs.component';
import { AccProfileComponent } from './dash-account/acc-profile/acc-profile.component';
import { AccTicketsComponent } from './dash-account/acc-tickets/acc-tickets.component';
import { DashAccountComponent } from './dash-account/dash-account.component';
import { DashHomeComponent } from './dash-home/dash-home.component';
import { DashParticipateComponent } from './dash-participate/dash-participate.component';
import { DashTeamManagComponent } from './dash-team-manag/dash-team-manag.component';
import { DashboardComponent } from './dashboard.component';
import { RouteLinks } from '../shared/Constants/ROUTE_LINKS';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    ...canActivate(redirectUnauthorizedToLogin),
    canDeactivate: [ExitDashGuard],
    children: [
      { path: RouteLinks.DASHBOARD[0], component: DashHomeComponent },
      { path: RouteLinks.DASHBOARD[1], component: DashTeamManagComponent },
      { path: RouteLinks.DASHBOARD[2], component: DashParticipateComponent },
      {
        path: RouteLinks.DASHBOARD[3],
        component: DashAccountComponent,
        children: [
          {
            path: RouteLinks.DASHBOARD_ACCOUNT[0],
            component: AccProfileComponent,
          },
          {
            path: RouteLinks.DASHBOARD_ACCOUNT[1],
            component: AccNotifsComponent,
          },
          {
            path: RouteLinks.DASHBOARD_ACCOUNT[2],
            component: AccAddressesComponent,
          },
          {
            path: RouteLinks.DASHBOARD_ACCOUNT[3],
            component: AccTicketsComponent,
          },
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
