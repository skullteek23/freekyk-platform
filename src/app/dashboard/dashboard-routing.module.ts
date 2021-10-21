import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { AccAddressesComponent } from './dash-account/acc-addresses/acc-addresses.component';
import { AccNotifsComponent } from './dash-account/acc-notifs/acc-notifs.component';
import { AccProfileComponent } from './dash-account/acc-profile/acc-profile.component';
import { AccTicketsComponent } from './dash-account/acc-tickets/acc-tickets.component';
import { DashAccountComponent } from './dash-account/dash-account.component';
import { DashHomeComponent } from './dash-home/dash-home.component';
import { DashParticipateComponent } from './dash-participate/dash-participate.component';
import { DashTeamManagComponent } from './dash-team-manag/dash-team-manag.component';
import { DashboardComponent } from './dashboard.component';
import { ErrorComponent } from '../error/error.component';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    ...canActivate(redirectUnauthorizedToLogin),
    children: [
      { path: 'home', component: DashHomeComponent },
      { path: 'team-management', component: DashTeamManagComponent },
      { path: 'participate', component: DashParticipateComponent },
      {
        path: 'account',
        component: DashAccountComponent,
        children: [
          {
            path: 'profile',
            component: AccProfileComponent,
          },
          {
            path: 'notifications',
            component: AccNotifsComponent,
          },
          {
            path: 'addresses',
            component: AccAddressesComponent,
          },
          {
            path: 'tickets',
            component: AccTicketsComponent,
          },
        ],
      },
      { path: 'error', component: ErrorComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
