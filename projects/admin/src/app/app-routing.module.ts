import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ErrorComponent } from './error/error.component';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';
import { AddSeasonComponent } from './season-panel/add-season/add-season.component';
import { GenFixturesComponent } from './season-panel/gen-fixtures/gen-fixtures.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { ViewSeasonComponent } from './season-panel/view-season/view-season.component';

const routes: Routes = [
  {
    path: '',
    component: AdminHomeComponent,
    children: [
      {
        path: 'seasons',
        component: SeasonPanelComponent,
        children: [
          { path: '', component: ViewSeasonComponent },
          { path: 'add', component: AddSeasonComponent },
          { path: 'edit/:sid', component: AddSeasonComponent },
          { path: 'fixtures/:sid', component: GenFixturesComponent },
          // { path: 'update/:sid', component: UpdateMrComponent },
          // { path: 'generate', component: GenFixturesComponent },
          // { path: 'gallery', component: GenFixturesComponent },
        ],
      },
      { path: 'grounds', component: GroundsPanelComponent },
    ]
  },

  // { path: 'players', component: PlayersPanelComponent },
  // { path: 'freestylers', component: FreestylersPanelComponent },
  // { path: 'tickets', component: TicketsPanelComponent },
  // { path: 'teams', component: TeamsPanelComponent },
  // { path: 'academies', component: AcademiesPanelComponent },
  // {
  //   path: 'equipment',
  //   component: EquipmentPanelComponent,
  //   children: [
  //     { path: 'add', component: AddProductComponent },
  //     { path: 'register-seller', component: RegiSellerComponent },
  //     { path: 'add-coupon', component: AddCouponComponent },
  //   ],
  // },
  // { path: 'contests', component: ContestPanelComponent },
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
