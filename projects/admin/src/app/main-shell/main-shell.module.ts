import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SnackBarModule } from '@shared/modules/snack-bar/snack-bar.module';
import { CanDeactivateGuardService } from '@shared/guards/can-deactivate-guard.service';
import { AdminConfigPanelComponent } from './components/admin-config-panel/admin-config-panel.component';
import { GroundsPanelComponent } from './components/grounds-panel/grounds-panel.component';
import { MyAccountPanelComponent } from './components/my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from './components/registrations-panel/registrations-panel.component';
import { MainShellComponent } from './main-shell.component';
import { AddSeasonComponent } from './components/season-panel/create-season/components/add-season/add-season.component';
import { ChipSelectionInputComponent } from './components/season-panel/chip-selection-input/chip-selection-input.component';
import { CreateSeasonComponent } from './components/season-panel/create-season/create-season.component';
import { FixtureTableComponent } from './components/season-panel/fixture-table/fixture-table.component';
import { GenerateFixturesComponent } from './components/season-panel/generate-fixtures/generate-fixtures.component';
import { LineInfoDisplayComponent } from './components/season-panel/line-info-display/line-info-display.component';
import { RequestDialogComponent } from './components/season-panel/request-dialog/request-dialog.component';
import { SeasonPanelComponent } from './components/season-panel/season-panel.component';
import { SelectGroundsComponent } from './components/season-panel/select-grounds/select-grounds.component';
import { UpdateMatchReportComponent } from './components/season-panel/update-match-report/update-match-report.component';
import { ViewSeasonsTableComponent } from './components/season-panel/view-seasons-table/view-seasons-table.component';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/material.module';
import { MatchReportSummaryComponent } from './components/season-panel/match-report-summary/match-report-summary.component';
import {
  SelectMatchTypeComponent
} from './components/season-panel/create-season/components/select-match-type/select-match-type.component';
import { SelectTeamsComponent } from './components/season-panel/create-season/components/select-teams/select-teams.component';
import { TeamSelectionListComponent } from './components/season-panel/team-selection-list/team-selection-list.component';
import { SelectGroundComponent } from './components/season-panel/create-season/components/select-ground/select-ground.component';
import { GroundFiltersComponent } from './components/season-panel/create-season/components/select-ground/components/ground-filters/ground-filters.component';
import { GroundSlotsComponent } from './components/season-panel/create-season/components/select-ground/components/ground-slots/ground-slots.component';
import { GroundSlotSelectionComponent } from './components/season-panel/create-season/components/select-ground/components/ground-slot-selection/ground-slot-selection.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '@shared/utils/appDateAdapter';
import { AdminPaymentComponent } from './components/season-panel/create-season/components/admin-payment/admin-payment.component';
import { ViewSummaryComponent } from './components/season-panel/create-season/components/view-summary/view-summary.component';
import { ViewPublishedSeasonComponent } from './components/season-panel/view-published-season/view-published-season.component';

const routes: Routes = [
  {

    path: '',
    component: MainShellComponent,
    children: [
      {
        path: 'seasons',
        component: SeasonPanelComponent,
        children: [
          { path: '', component: ViewSeasonsTableComponent, pathMatch: 'full' },
          { path: 'list', component: ViewSeasonsTableComponent },
          { path: 'create', component: CreateSeasonComponent },
          { path: ':seasonid', component: ViewPublishedSeasonComponent },
        ],
      },
      { path: 'grounds', component: GroundsPanelComponent },
      { path: 'account', component: MyAccountPanelComponent },
      { path: 'manage-requests', component: RegistrationsPanelComponent },
      { path: 'configurations', component: AdminConfigPanelComponent },
    ]
  },
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
    SelectGroundsComponent,
    LineInfoDisplayComponent,
    GenerateFixturesComponent,
    RequestDialogComponent,
    UpdateMatchReportComponent,
    ChipSelectionInputComponent,
    MyAccountPanelComponent,
    RegistrationsPanelComponent,
    AdminConfigPanelComponent,
    MatchReportSummaryComponent,
    SelectMatchTypeComponent,
    SelectTeamsComponent,
    TeamSelectionListComponent,
    SelectGroundComponent,
    GroundFiltersComponent,
    GroundSlotsComponent,
    GroundSlotSelectionComponent,
    AdminPaymentComponent,
    ViewSummaryComponent,
    ViewPublishedSeasonComponent
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
    SnackBarModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class MainShellModule { }
