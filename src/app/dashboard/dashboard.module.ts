import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashHomeComponent } from './dash-home/dash-home.component';
import { DashTeamManagComponent } from './dash-team-manag/dash-team-manag.component';
import { DashAccountComponent } from './dash-account/dash-account.component';
import { DashFooterComponent } from './dash-footer/dash-footer.component';
import { DashParticipateComponent } from './dash-participate/dash-participate.component';
import { AccProfileComponent } from './dash-account/acc-profile/acc-profile.component';
import { AccNotifsComponent } from './dash-account/acc-notifs/acc-notifs.component';
import { AccAddressesComponent } from './dash-account/acc-addresses/acc-addresses.component';
import { AccTicketsComponent } from './dash-account/acc-tickets/acc-tickets.component';
import { DaHoProfileComponent } from './dash-home/da-ho-profile/da-ho-profile.component';
import { DaHoAllFixturesComponent } from './dash-home/da-ho-all-fixtures/da-ho-all-fixtures.component';
import { DaHoAllContestsComponent } from './dash-home/da-ho-all-contests/da-ho-all-contests.component';
import { DaHoStatsCardComponent } from './dash-home/da-ho-stats-card/da-ho-stats-card.component';
import { DaHoCompleteProfileComponent } from './dash-home/da-ho-complete-profile/da-ho-complete-profile.component';
import { DaHoInvitesListComponent } from './dash-home/da-ho-invites-list/da-ho-invites-list.component';
import { DaHoNotifsComponent } from './dash-home/da-ho-notifs/da-ho-notifs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DaHoUpcomingMatchComponent } from './dash-home/da-ho-upcoming-match/da-ho-upcoming-match.component';
import { DaTeJoinRequestsComponent } from './dash-team-manag/da-te-members/da-te-join-requests/da-te-join-requests.component';
import { DaTeMembersComponent } from './dash-team-manag/da-te-members/da-te-members.component';
import { DaTeCommunicationComponent } from './dash-team-manag/da-te-communication/da-te-communication.component';
import { DaTeGalleryComponent } from './dash-team-manag/da-te-gallery/da-te-gallery.component';
import { DaTeStatsComponent } from './dash-team-manag/da-te-stats/da-te-stats.component';
import { DaTeProfileComponent } from './dash-team-manag/da-te-profile/da-te-profile.component';
import { GalleryCardComponent } from './dash-team-manag/da-te-gallery/gallery-card/gallery-card.component';
import { CurrentMatchComponent } from './dash-team-manag/da-te-communication/current-match/current-match.component';
import { TeamActivityComponent } from './dash-team-manag/da-te-communication/team-activity/team-activity.component';

import { TeamjoinComponent } from './dialogs/teamjoin/teamjoin.component';
import { TeamsettingsComponent } from './dialogs/teamsettings/teamsettings.component';
import { TeamcreateComponent } from './dialogs/teamcreate/teamcreate.component';
import { FixtureDashboardComponent } from './dash-home/da-ho-all-fixtures/fixture-dashboard/fixture-dashboard.component';
import { MemberListComponent } from './dash-team-manag/da-te-members/member-list/member-list.component';
import { NotificationsListComponent } from './dash-home/da-ho-notifs/notifications-list/notifications-list.component';
import { InviteAcceptCardComponent } from './dialogs/invite-accept-card/invite-accept-card.component';
import { UploadphotoComponent } from './dialogs/uploadphoto/uploadphoto.component';
import { SendinviteComponent } from './dialogs/sendinvite/sendinvite.component';
import { ActiveSquadComponent } from './dash-team-manag/da-te-communication/active-squad/active-squad.component';
import { AskPlayerSelectorComponent } from './dash-team-manag/da-te-communication/ask-player-selector/ask-player-selector.component';
import { UpcomingMatchTabComponent } from './dash-team-manag/da-te-communication/upcoming-match-tab/upcoming-match-tab.component';
import { DaTeMangPlayersComponent } from './dash-team-manag/da-te-members/da-te-mang-players/da-te-mang-players.component';
import { InvitePlayersComponent } from './dialogs/invite-players/invite-players.component';
import { TeamgalleryComponent } from './dialogs/teamgallery/teamgallery.component';
import { HttpClientModule } from '@angular/common/http';
import { LocationService } from '../../../shared/services/location-cities.service';
import { environment } from 'environments/environment';
import { RazorPayAPI } from '@shared/Constants/RAZORPAY';
import { PaymentService } from '../../../shared/services/payment.service';
import { PlayerService } from '../services/player.service';
import { TeamService } from '../services/team.service';
import { MaterialModule } from '@shared/material.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeactivateProfileRequestComponent } from '../dashboard/dialogs/deactivate-profile-request/deactivate-profile-request.component';
import { UploadTeamPhotoComponent } from './dialogs/upload-team-photo/upload-team-photo.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashHomeComponent,
    DashTeamManagComponent,
    DashAccountComponent,
    DashFooterComponent,
    DashParticipateComponent,
    AccProfileComponent,
    AccNotifsComponent,
    AccAddressesComponent,
    AccTicketsComponent,
    DaHoProfileComponent,
    DaHoAllFixturesComponent,
    DaHoAllContestsComponent,
    DaHoStatsCardComponent,
    DaHoCompleteProfileComponent,
    DaHoInvitesListComponent,
    DaHoNotifsComponent,
    DaHoUpcomingMatchComponent,
    DaTeJoinRequestsComponent,
    DaTeMembersComponent,
    DaTeCommunicationComponent,
    DaTeGalleryComponent,
    DaTeStatsComponent,
    DaTeProfileComponent,
    GalleryCardComponent,
    CurrentMatchComponent,
    TeamActivityComponent,
    TeamsettingsComponent,
    TeamcreateComponent,
    TeamjoinComponent,
    FixtureDashboardComponent,
    MemberListComponent,
    NotificationsListComponent,
    InviteAcceptCardComponent,
    UploadphotoComponent,
    SendinviteComponent,
    ActiveSquadComponent,
    AskPlayerSelectorComponent,
    UpcomingMatchTabComponent,
    DaTeMangPlayersComponent,
    InvitePlayersComponent,
    TeamgalleryComponent,
    DeactivateProfileRequestComponent,
    UploadTeamPhotoComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    MaterialModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FlexLayoutModule
  ],
  exports: [],
  providers: [
    LocationService,
    { provide: RazorPayAPI, useValue: environment.razorPay },
    PaymentService,
  ],
})
export class DashboardModule {
  constructor(playerService: PlayerService, teamService: TeamService) { }
}
