import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcademiesPanelComponent } from './academies-panel/academies-panel.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AppComponent } from './app.component';
import { ContestPanelComponent } from './contest-panel/contest-panel.component';
import { AddCouponComponent } from './equipment-panel/add-coupon/add-coupon.component';
import { AddProductComponent } from './equipment-panel/add-product/add-product.component';
import { EquipmentPanelComponent } from './equipment-panel/equipment-panel.component';
import { RegiSellerComponent } from './equipment-panel/regi-seller/regi-seller.component';
import { ErrorComponent } from './error/error.component';
import { FreestylersPanelComponent } from './freestylers-panel/freestylers-panel.component';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';
import { PlayersPanelComponent } from './players-panel/players-panel.component';
import { AddSeasonComponent } from './season-panel/add-season/add-season.component';
import { GenFixturesComponent } from './season-panel/gen-fixtures/gen-fixtures.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { UpdateMrComponent } from './season-panel/update-mr/update-mr.component';
import { ViewSeasonComponent } from './season-panel/view-season/view-season.component';
import { TeamsPanelComponent } from './teams-panel/teams-panel.component';
import { TicketsPanelComponent } from './tickets-panel/tickets-panel.component';

const routes: Routes = [
  {
    path: '',
    component: AdminHomeComponent,
  },
  {
    path: 'seasons',
    component: SeasonPanelComponent,
    children: [
      { path: 'add', component: AddSeasonComponent },
      { path: 'view', component: ViewSeasonComponent },
      { path: 'update', component: UpdateMrComponent },
      { path: 'generate', component: GenFixturesComponent },
    ],
  },
  { path: 'grounds', component: GroundsPanelComponent },
  { path: 'players', component: PlayersPanelComponent },
  { path: 'freestylers', component: FreestylersPanelComponent },
  { path: 'tickets', component: TicketsPanelComponent },
  { path: 'teams', component: TeamsPanelComponent },
  { path: 'academies', component: AcademiesPanelComponent },
  {
    path: 'equipment',
    component: EquipmentPanelComponent,
    children: [
      { path: 'add', component: AddProductComponent },
      { path: 'register-seller', component: RegiSellerComponent },
      { path: 'add-coupon', component: AddCouponComponent },
    ],
  },
  { path: 'contests', component: ContestPanelComponent },
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
