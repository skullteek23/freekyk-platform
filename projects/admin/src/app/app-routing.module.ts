import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ErrorComponent } from './error/error.component';
import { GroundsPanelComponent } from './panels/grounds-panel/grounds-panel.component';
import { CreateSeasonContainerComponent } from './season-panel/create-season-container/create-season-container.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { ViewSeasonsTableComponent } from './season-panel/view-seasons-table/view-seasons-table.component';
import { CanDeactivateGuardService } from './shared/guards/can-deactivate-guard.service';
import { ViewSeasonDraftComponent } from './season-panel/view-season-draft/view-season-draft.component';
import { MyAccountPanelComponent } from './panels/my-account-panel/my-account-panel.component';
import { AdminConfigPanelComponent } from './panels/admin-config-panel/admin-config-panel.component';
import { RegistrationsPanelComponent } from './panels/registrations-panel/registrations-panel.component';

const redirectLoggedUserTo = () => redirectLoggedInTo(['/seasons']);

const routes: Routes = [
  {
    path: 'register',
    component: AdminHomeComponent,
    ...canActivate(redirectLoggedUserTo),
  },
  {
    path: 'login',
    component: AdminHomeComponent,
    ...canActivate(redirectLoggedUserTo),
  },
  {
    path: 'seasons',
    component: SeasonPanelComponent,
    children: [
      { path: '', component: ViewSeasonsTableComponent, pathMatch: 'full' },
      { path: 'list', component: ViewSeasonsTableComponent },
      { path: 'create', component: CreateSeasonContainerComponent, canDeactivate: [CanDeactivateGuardService] },
      { path: 'create/:draftID', component: CreateSeasonContainerComponent, canDeactivate: [CanDeactivateGuardService] },
      { path: 's/:draftid', component: ViewSeasonDraftComponent }
    ],
  },
  { path: 'grounds', component: GroundsPanelComponent },
  { path: 'account', component: MyAccountPanelComponent },
  { path: 'manage-requests', component: RegistrationsPanelComponent },
  { path: 'configurations', component: AdminConfigPanelComponent },
  {
    path: 'error',
    component: ErrorComponent,
    data: {
      message: 'We are sorry, but the page you requested was not found!',
      code: '404',
    },
  },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
