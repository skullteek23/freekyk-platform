import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminConfigPanelComponent } from '../panels/admin-config-panel/admin-config-panel.component';
import { GroundsPanelComponent } from '../panels/grounds-panel/grounds-panel.component';
import { MyAccountPanelComponent } from '../panels/my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from '../panels/registrations-panel/registrations-panel.component';
import { CreateSeasonContainerComponent } from '../season-panel/create-season-container/create-season-container.component';
import { SeasonPanelComponent } from '../season-panel/season-panel.component';
import { ViewSeasonDraftComponent } from '../season-panel/view-season-draft/view-season-draft.component';
import { ViewSeasonsTableComponent } from '../season-panel/view-seasons-table/view-seasons-table.component';
import { CanDeactivateGuardService } from '../shared/guards/can-deactivate-guard.service';
import { RouterModule } from '@angular/router';

const routes = [
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
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MainShellModule { }
