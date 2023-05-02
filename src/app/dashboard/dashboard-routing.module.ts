import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
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
      {
        path: 'home', component: DashHomeComponent,
      },
      { path: 'team-management', component: DashTeamManagComponent },
      { path: 'participate', component: DashParticipateComponent },
      { path: 'participate/:season', component: DashParticipateComponent },
      { path: 'error', component: ErrorComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
