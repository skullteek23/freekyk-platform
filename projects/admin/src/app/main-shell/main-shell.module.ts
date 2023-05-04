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
import { AdminConfigPanelComponent } from './components/admin-config-panel/admin-config-panel.component';
import { GroundsPanelComponent } from './components/grounds-panel/grounds-panel.component';
import { MyAccountPanelComponent } from './components/my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from './components/registrations-panel/registrations-panel.component';
import { MainShellComponent } from './main-shell.component';
import { AddSeasonComponent } from './components/season-panel/create-season/components/add-season/add-season.component';
import { ChipSelectionInputComponent } from './components/season-panel/update-match-report/components/chip-selection-input/chip-selection-input.component';
import { CreateSeasonComponent } from './components/season-panel/create-season/create-season.component';
import { FixtureTableComponent } from './components/season-panel/fixture-table/fixture-table.component';
import { GenerateFixturesComponent } from './components/season-panel/create-season/components/generate-fixtures/generate-fixtures.component';
import { RequestDialogComponent } from './components/season-panel/request-dialog/request-dialog.component';
import { SeasonPanelComponent } from './components/season-panel/season-panel.component';
import { UpdateMatchReportComponent } from './components/season-panel/update-match-report/update-match-report.component';
import { ViewSeasonsTableComponent } from './components/season-panel/view-seasons-table/view-seasons-table.component';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/material.module';
import { MatchReportSummaryComponent } from './components/season-panel/update-match-report/components/match-report-summary/match-report-summary.component';
import { SelectMatchTypeComponent } from './components/season-panel/create-season/components/select-match-type/select-match-type.component';
import { SelectTeamsComponent } from './components/season-panel/create-season/components/select-teams/select-teams.component';
import { SelectGroundComponent } from './components/season-panel/create-season/components/select-ground/select-ground.component';
import { GroundFiltersComponent } from './components/season-panel/create-season/components/select-ground/components/ground-filters/ground-filters.component';
import { GroundSlotsComponent } from './components/season-panel/create-season/components/select-ground/components/ground-slots/ground-slots.component';
import { GroundSlotSelectionComponent } from './components/season-panel/create-season/components/select-ground/components/ground-slot-selection/ground-slot-selection.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '@shared/utils/appDateAdapter';
import { ViewSummaryComponent } from './components/season-panel/create-season/components/view-summary/view-summary.component';
import { ViewPublishedSeasonComponent } from './components/season-panel/view-published-season/view-published-season.component';
import { RegisterGroundComponent } from './components/grounds-panel/register-ground/register-ground.component';
import { ViewGroundsTableComponent } from './components/grounds-panel/view-grounds-table/view-grounds-table.component';
import { ViewRegisteredGroundComponent } from './components/grounds-panel/view-registered-ground/view-registered-ground.component';
import { GroundDetailsComponent } from './components/grounds-panel/register-ground/components/ground-details/ground-details.component';
import { GroundAvailabilityComponent } from './components/grounds-panel/register-ground/components/ground-availability/ground-availability.component';
import { GroundFormSummaryComponent } from './components/grounds-panel/register-ground/components/ground-form-summary/ground-form-summary.component';
import { AuthInterceptor } from '@admin/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AddGalleryDialogComponent } from './components/season-panel/add-gallery-dialog/add-gallery-dialog.component';
import { CancelDialogComponent } from './components/season-panel/cancel-dialog/cancel-dialog.component';
import { AbortDialogComponent } from './components/season-panel/abort-dialog/abort-dialog.component';
import { RescheduleMatchDialogComponent } from './components/season-panel/reschedule-match-dialog/reschedule-match-dialog.component';
import { AddSponsorComponent } from './components/season-panel/add-sponsor/add-sponsor.component';
import { MatchRequestsPanelComponent } from './components/match-requests-panel/match-requests-panel.component';
import { TicketsPanelComponent } from './components/tickets-panel/tickets-panel.component';


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
      {
        path: 'grounds', component: GroundsPanelComponent,
        children: [
          { path: '', component: ViewGroundsTableComponent, pathMatch: 'full' },
          { path: 'list', component: ViewGroundsTableComponent },
          { path: 'register', component: RegisterGroundComponent },
          { path: ':groundid', component: ViewRegisteredGroundComponent },
        ],
      },
      { path: 'account', component: MyAccountPanelComponent },
      { path: 'manage-requests', component: RegistrationsPanelComponent },
      { path: 'match-requests', component: MatchRequestsPanelComponent },
      { path: 'configurations', component: AdminConfigPanelComponent },
      { path: 'tickets', component: TicketsPanelComponent },
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
    SelectGroundComponent,
    GroundFiltersComponent,
    GroundSlotsComponent,
    GroundSlotSelectionComponent,
    ViewSummaryComponent,
    ViewPublishedSeasonComponent,
    RegisterGroundComponent,
    ViewGroundsTableComponent,
    ViewRegisteredGroundComponent,
    GroundDetailsComponent,
    GroundAvailabilityComponent,
    GroundFormSummaryComponent,
    AddGalleryDialogComponent,
    CancelDialogComponent,
    AbortDialogComponent,
    RescheduleMatchDialogComponent,
    AddSponsorComponent,
    MatchRequestsPanelComponent,
    TicketsPanelComponent,
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
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class MainShellModule { }
