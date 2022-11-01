import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CanDeactivateGuardService } from '@shared/guards/can-deactivate-guard.service';
import { RouterModule } from '@angular/router';
import { MainShellComponent } from './main-shell.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarModule } from '@shared/modules/snack-bar/snack-bar.module';
import { AdminConfigPanelComponent } from './components/admin-config-panel/admin-config-panel.component';
import { GroundsPanelComponent } from './components/grounds-panel/grounds-panel.component';
import { MyAccountPanelComponent } from './components/my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from './components/registrations-panel/registrations-panel.component';
import { AddSeasonComponent } from './components/season-panel/add-season/add-season.component';
import { ChipSelectionInputComponent } from './components/season-panel/chip-selection-input/chip-selection-input.component';
import { CreateSeasonContainerComponent } from './components/season-panel/create-season-container/create-season-container.component';
import { CreateSeasonComponent } from './components/season-panel/create-season/create-season.component';
import { FixtureTableComponent } from './components/season-panel/fixture-table/fixture-table.component';
import { GenerateFixturesComponent } from './components/season-panel/generate-fixtures/generate-fixtures.component';
import { LineInfoDisplayComponent } from './components/season-panel/line-info-display/line-info-display.component';
import { RequestDialogComponent } from './components/season-panel/request-dialog/request-dialog.component';
import { SeasonPanelComponent } from './components/season-panel/season-panel.component';
import { SelectGroundsComponent } from './components/season-panel/select-grounds/select-grounds.component';
import { UpdateMatchReportComponent } from './components/season-panel/update-match-report/update-match-report.component';
import { ViewSeasonDraftComponent } from './components/season-panel/view-season-draft/view-season-draft.component';
import { ViewSeasonsTableComponent } from './components/season-panel/view-seasons-table/view-seasons-table.component';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/material.module';
import { MatchReportSummaryComponent } from './components/season-panel/match-report-summary/match-report-summary.component';

const routes = [
  {
    path: '',
    component: SeasonPanelComponent,
    pathMatch: 'full',
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
    SeasonPanelComponent,
    AddSeasonComponent,
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
    MyAccountPanelComponent,
    RegistrationsPanelComponent,
    AdminConfigPanelComponent,
    MatchReportSummaryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    SnackBarModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [DatePipe]
})
export class MainShellModule { }
