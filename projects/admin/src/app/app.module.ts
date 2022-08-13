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
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';

import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ErrorComponent } from './error/error.component';
import { AddSeasonComponent } from './season-panel/add-season/add-season.component';
import { GenFixturesComponent } from './season-panel/gen-fixtures/gen-fixtures.component';
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { UpdateMrComponent } from './season-panel/update-mr/update-mr.component';
import { ViewSeasonComponent } from './season-panel/view-season/view-season.component';
import { SharedAdminModule } from './shared/shared-admin.module';
import { GroundsPanelComponent } from './grounds-panel/grounds-panel.component';
import { FixtureTableComponent } from './season-panel/fixture-table/fixture-table.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminHomeComponent,
    SeasonPanelComponent,
    AddSeasonComponent,
    GenFixturesComponent,
    UpdateMrComponent,
    ViewSeasonComponent,
    ErrorComponent,
    GroundsPanelComponent,
    FixtureTableComponent,
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
export class AppModule { }
