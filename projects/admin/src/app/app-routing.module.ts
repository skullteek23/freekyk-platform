import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ErrorComponent } from './error/error.component';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';
import { CreateSeasonContainerComponent } from './season-panel/create-season-container/create-season-container.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { ViewSeasonsTableComponent } from './season-panel/view-seasons-table/view-seasons-table.component';
import { CanDeactivateGuardService } from './shared/guards/can-deactivate-guard.service';
import { ViewSeasonDraftComponent } from './season-panel/view-season-draft/view-season-draft.component';

const routes: Routes = [
  {
    path: '',
    component: AdminHomeComponent,
    children: [
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
    ]
  },
  {
    path: 'error',
    component: ErrorComponent,
    data: {
      message: 'We are sorry, but the page you requested was not found!',
      code: '404',
    },
  },
  // { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
