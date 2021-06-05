import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { ContestPanelComponent } from './contest-panel/contest-panel.component';
import { TeamsPanelComponent } from './teams-panel/teams-panel.component';
import { EquipmentPanelComponent } from './equipment-panel/equipment-panel.component';
import { AcademiesPanelComponent } from './academies-panel/academies-panel.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TicketsPanelComponent } from './tickets-panel/tickets-panel.component';
import { TicketViewerComponent } from './ticket-viewer/ticket-viewer.component';
import { PlayersPanelComponent } from './players-panel/players-panel.component';
import { FreestylersPanelComponent } from './freestylers-panel/freestylers-panel.component';
import { AddSeasonComponent } from './season-panel/add-season/add-season.component';
import { ViewSeasonComponent } from './season-panel/view-season/view-season.component';
import { UpdateMrComponent } from './season-panel/update-mr/update-mr.component';
import { GenFixturesComponent } from './season-panel/gen-fixtures/gen-fixtures.component';
import { GfSelSeasonComponent } from './season-panel/gen-fixtures/gf-sel-season/gf-sel-season.component';
import { GfSelGroundComponent } from './season-panel/gen-fixtures/gf-sel-ground/gf-sel-ground.component';
import { GfGenFixturesComponent } from './season-panel/gen-fixtures/gf-gen-fixtures/gf-gen-fixtures.component';
import { MatchCardAdminComponent } from './dialogs/match-card-admin/match-card-admin.component';
import { AddProductComponent } from './equipment-panel/add-product/add-product.component';
import { RegiSellerComponent } from './equipment-panel/regi-seller/regi-seller.component';
import { AddCouponComponent } from './equipment-panel/add-coupon/add-coupon.component';

@NgModule({
  declarations: [
    AdminComponent,
    SeasonPanelComponent,
    ContestPanelComponent,
    TeamsPanelComponent,
    EquipmentPanelComponent,
    AcademiesPanelComponent,
    AdminHomeComponent,
    GroundsPanelComponent,
    TicketsPanelComponent,
    TicketViewerComponent,
    PlayersPanelComponent,
    FreestylersPanelComponent,
    AddSeasonComponent,
    ViewSeasonComponent,
    UpdateMrComponent,
    GenFixturesComponent,
    GfSelSeasonComponent,
    GfSelGroundComponent,
    GfGenFixturesComponent,
    MatchCardAdminComponent,
    AddProductComponent,
    RegiSellerComponent,
    AddCouponComponent,
  ],
  imports: [SharedModule, AdminRoutingModule, ReactiveFormsModule],
})
export class AdminModule {}
