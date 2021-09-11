import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from 'src/app/admin/admin.component';
import { AddCouponComponent } from 'src/app/admin/equipment-panel/add-coupon/add-coupon.component';
import { AddProductComponent } from 'src/app/admin/equipment-panel/add-product/add-product.component';
import { EquipmentPanelComponent } from 'src/app/admin/equipment-panel/equipment-panel.component';
import { RegiSellerComponent } from 'src/app/admin/equipment-panel/regi-seller/regi-seller.component';
import { AddSeasonComponent } from 'src/app/admin/season-panel/add-season/add-season.component';
import { GenFixturesComponent } from 'src/app/admin/season-panel/gen-fixtures/gen-fixtures.component';
import { SeasonPanelComponent } from 'src/app/admin/season-panel/season-panel.component';
import { UpdateMrComponent } from 'src/app/admin/season-panel/update-mr/update-mr.component';
import { ViewSeasonComponent } from 'src/app/admin/season-panel/view-season/view-season.component';
import { AcademiesPanelComponent } from './academies-panel/academies-panel.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ContestPanelComponent } from './contest-panel/contest-panel.component';
import { FreestylersPanelComponent } from './freestylers-panel/freestylers-panel.component';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';
import { PlayersPanelComponent } from './players-panel/players-panel.component';
import { TeamsPanelComponent } from './teams-panel/teams-panel.component';
import { TicketsPanelComponent } from './tickets-panel/tickets-panel.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'home', component: AdminHomeComponent },
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
