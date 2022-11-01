import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminConfigPanelComponent } from '../panels/admin-config-panel/admin-config-panel.component';
import { GroundsPanelComponent } from '../panels/grounds-panel/grounds-panel.component';
import { MyAccountPanelComponent } from '../panels/my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from '../panels/registrations-panel/registrations-panel.component';
import { CanDeactivateGuardService } from '../shared/guards/can-deactivate-guard.service';
import { RouterModule } from '@angular/router';
import { MainShellComponent } from './main-shell.component';
import { CreateSeasonContainerComponent } from '../panels/season-panel/create-season-container/create-season-container.component';
import { SeasonPanelComponent } from '../panels/season-panel/season-panel.component';
import { ViewSeasonDraftComponent } from '../panels/season-panel/view-season-draft/view-season-draft.component';
import { ViewSeasonsTableComponent } from '../panels/season-panel/view-seasons-table/view-seasons-table.component';
import { SharedAdminModule } from '../shared/shared-admin.module';
import { AppMaterialModule } from '../app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorComponent } from '../error/error.component';
import { AddSeasonComponent } from '../panels/season-panel/add-season/add-season.component';
import { ChipSelectionInputComponent } from '../panels/season-panel/chip-selection-input/chip-selection-input.component';
import { CreateSeasonComponent } from '../panels/season-panel/create-season/create-season.component';
import { FixtureTableComponent } from '../panels/season-panel/fixture-table/fixture-table.component';
import { GenerateFixturesComponent } from '../panels/season-panel/generate-fixtures/generate-fixtures.component';
import { LineInfoDisplayComponent } from '../panels/season-panel/line-info-display/line-info-display.component';
import { RequestDialogComponent } from '../panels/season-panel/request-dialog/request-dialog.component';
import { SelectGroundsComponent } from '../panels/season-panel/select-grounds/select-grounds.component';
import { UpdateMatchReportComponent } from '../panels/season-panel/update-match-report/update-match-report.component';
import { SnackBarModule } from 'src/app/shared/snack-bar/snack-bar.module';
import { AdminHomeComponent } from '../admin-home/admin-home.component';

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
  declarations: [
    MainShellComponent,
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
  ],
  imports: [
    CommonModule,
    SharedAdminModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    FlexLayoutModule,
    BrowserModule,
    BrowserAnimationsModule,
    SnackBarModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MainShellModule { }
