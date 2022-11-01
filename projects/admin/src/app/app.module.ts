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
import { SeasonPanelComponent } from './season-panel/season-panel.component';
import { SharedAdminModule } from './shared/shared-admin.module';
import { GroundsPanelComponent } from './panels/grounds-panel/grounds-panel.component';
import { FixtureTableComponent } from './season-panel/fixture-table/fixture-table.component';
import { ViewSeasonsTableComponent } from './season-panel/view-seasons-table/view-seasons-table.component';
import { CreateSeasonComponent } from './season-panel/create-season/create-season.component';
import { CreateSeasonContainerComponent } from './season-panel/create-season-container/create-season-container.component';
import { SelectGroundsComponent } from './season-panel/select-grounds/select-grounds.component';
import { LineInfoDisplayComponent } from './season-panel/line-info-display/line-info-display.component';
import { ViewSeasonDraftComponent } from './season-panel/view-season-draft/view-season-draft.component';
import { DatePipe } from '@angular/common';
import { GenerateFixturesComponent } from './season-panel/generate-fixtures/generate-fixtures.component';
import { RequestDialogComponent } from './season-panel/request-dialog/request-dialog.component';
import { UpdateMatchReportComponent } from './season-panel/update-match-report/update-match-report.component';
import { ChipSelectionInputComponent } from './season-panel/chip-selection-input/chip-selection-input.component';
import { MatchReportSummaryComponent } from './season-panel/match-report-summary/match-report-summary.component';
import { REGION } from '@angular/fire/functions';
import { SnackBarModule } from 'src/app/shared/snack-bar/snack-bar.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MyAccountPanelComponent } from './my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from './panels/registrations-panel/registrations-panel.component';
import { AdminConfigPanelComponent } from './admin-config-panel/admin-config-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminHomeComponent,
    SeasonPanelComponent,
    AddSeasonComponent,
    ErrorComponent,
    GroundsPanelComponent,
    FixtureTableComponent,
    ViewSeasonsTableComponent,
    CreateSeasonComponent,
    CreateSeasonContainerComponent,
    SelectGroundsComponent,
    LineInfoDisplayComponent,
    ViewSeasonDraftComponent,
    GenerateFixturesComponent,
    RequestDialogComponent,
    UpdateMatchReportComponent,
    ChipSelectionInputComponent,
    MatchReportSummaryComponent,
    LoginComponent,
    SignupComponent,
    MyAccountPanelComponent,
    RegistrationsPanelComponent,
    AdminConfigPanelComponent

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
    SnackBarModule
  ],
  providers: [
    { provide: REGION, useValue: 'asia-south1' },
    DatePipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
