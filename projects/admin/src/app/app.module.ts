import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from 'projects/admin/src/app/app-material.module';
import { environment } from '../environments/environment';
import { AcademiesPanelComponent } from './academies-panel/academies-panel.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContestPanelComponent } from './contest-panel/contest-panel.component';
import { AddCouponComponent } from './equipment-panel/add-coupon/add-coupon.component';
import { AddProductComponent } from './equipment-panel/add-product/add-product.component';
import { EquipmentPanelComponent } from './equipment-panel/equipment-panel.component';
import { RegiSellerComponent } from './equipment-panel/regi-seller/regi-seller.component';
import { ErrorComponent } from './error/error.component';
import { FreestylersPanelComponent } from './freestylers-panel/freestylers-panel.component';
import { PlayersPanelComponent } from './players-panel/players-panel.component';
import { AddSeasonComponent } from './season-panel/add-season/add-season.component';
import { GenFixturesComponent } from './season-panel/gen-fixtures/gen-fixtures.component';
import { GfGenFixturesComponent } from './season-panel/gen-fixtures/gf-gen-fixtures/gf-gen-fixtures.component';
import { GfSelGroundComponent } from './season-panel/gen-fixtures/gf-sel-ground/gf-sel-ground.component';
import { GfSelSeasonComponent } from './season-panel/gen-fixtures/gf-sel-season/gf-sel-season.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { UpdateMrComponent } from './season-panel/update-mr/update-mr.component';
import { ViewSeasonComponent } from './season-panel/view-season/view-season.component';
import { SharedAdminModule } from './shared/shared-admin.module';
import { TeamsPanelComponent } from './teams-panel/teams-panel.component';
import { TicketViewerComponent } from './ticket-viewer/ticket-viewer.component';
import { TicketsPanelComponent } from './tickets-panel/tickets-panel.component';
import { AddGalleryComponent } from './season-panel/add-gallery/add-gallery.component';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    AcademiesPanelComponent,
    AdminHomeComponent,
    ContestPanelComponent,
    EquipmentPanelComponent,
    FreestylersPanelComponent,
    PlayersPanelComponent,
    TicketsPanelComponent,
    TicketViewerComponent,
    TeamsPanelComponent,
    SeasonPanelComponent,
    AddSeasonComponent,
    GenFixturesComponent,
    UpdateMrComponent,
    ViewSeasonComponent,
    GfGenFixturesComponent,
    GfSelGroundComponent,
    GfSelSeasonComponent,
    AddCouponComponent,
    AddProductComponent,
    RegiSellerComponent,
    ErrorComponent,
    AddGalleryComponent,
    GroundsPanelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    SharedAdminModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
