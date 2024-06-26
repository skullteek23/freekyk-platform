import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashHomeComponent } from './dash-home/dash-home.component';
import { DashTeamManagComponent } from './dash-team-manag/dash-team-manag.component';
import { DashFooterComponent } from './dash-footer/dash-footer.component';
import { DashParticipateComponent } from './dash-participate/dash-participate.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DaTeJoinRequestsComponent } from './dash-team-manag/da-te-members/da-te-join-requests/da-te-join-requests.component';
import { DaTeMembersComponent } from './dash-team-manag/da-te-members/da-te-members.component';
import { DaTeGalleryComponent } from './dash-team-manag/da-te-gallery/da-te-gallery.component';
import { DaTeProfileComponent } from './dash-team-manag/da-te-profile/da-te-profile.component';
import { GalleryCardComponent } from './dash-team-manag/da-te-gallery/gallery-card/gallery-card.component';
import { TeamActivityComponent } from './dash-team-manag/team-activity/team-activity.component';

import { TeamjoinComponent } from './dialogs/teamjoin/teamjoin.component';
import { TeamsettingsComponent } from './dialogs/teamsettings/teamsettings.component';
import { TeamcreateComponent } from './dialogs/teamcreate/teamcreate.component';
import { MemberListComponent } from './dash-team-manag/da-te-members/member-list/member-list.component';
import { NotificationsListComponent } from './dash-home/notifications-list/notifications-list.component';
import { InviteAcceptCardComponent } from './dialogs/invite-accept-card/invite-accept-card.component';
import { UploadphotoComponent } from './dialogs/uploadphoto/uploadphoto.component';
import { DaTeMangPlayersComponent } from './dash-team-manag/da-te-members/da-te-mang-players/da-te-mang-players.component';
import { InvitePlayersComponent } from './dialogs/invite-players/invite-players.component';
import { TeamgalleryComponent } from './dialogs/teamgallery/teamgallery.component';
import { HttpClientModule } from '@angular/common/http';
import { LocationService } from '../../../shared/services/location-cities.service';
import { environment } from 'environments/environment';
import { RazorPayAPI } from '@shared/constants/RAZORPAY';
import { PaymentService } from '../../../shared/services/payment.service';
import { MaterialModule } from '@shared/material.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeactivateProfileRequestComponent } from '../dashboard/dialogs/deactivate-profile-request/deactivate-profile-request.component';
import { UploadTeamPhotoComponent } from './dialogs/upload-team-photo/upload-team-photo.component';
import { JoinTeamRequestDialogComponent } from './dialogs/join-team-request-dialog/join-team-request-dialog.component';
import { MyMatchesComponent } from './dash-home/my-matches/my-matches.component';

import { MyTeamMenuComponent } from './dash-home/my-team-menu/my-team-menu.component';
import { TeamMembersComponent } from './dash-team-manag/team-members/team-members.component';
import { ManageMembersComponent } from './dialogs/manage-members/manage-members.component';
import { InvitedPlayersListComponent } from './dash-team-manag/invited-players-list/invited-players-list.component';
import { TeamCommunicationComponent } from './dash-team-manag/team-communication/team-communication.component';
import { PendingPaymentComponent } from './dash-home/pending-payment/pending-payment.component';
import { UpcomingMatchComponent } from './dash-home/upcoming-match/upcoming-match.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashHomeComponent,
    DashTeamManagComponent,
    DashFooterComponent,
    DashParticipateComponent,
    DaTeJoinRequestsComponent,
    DaTeMembersComponent,
    DaTeGalleryComponent,
    DaTeProfileComponent,
    GalleryCardComponent,
    TeamActivityComponent,
    TeamsettingsComponent,
    TeamcreateComponent,
    TeamjoinComponent,
    MemberListComponent,
    NotificationsListComponent,
    InviteAcceptCardComponent,
    UploadphotoComponent,
    DaTeMangPlayersComponent,
    InvitePlayersComponent,
    TeamgalleryComponent,
    DeactivateProfileRequestComponent,
    UploadTeamPhotoComponent,
    JoinTeamRequestDialogComponent,
    UpcomingMatchComponent,
    MyMatchesComponent,
    MyTeamMenuComponent,
    TeamMembersComponent,
    ManageMembersComponent,
    InvitedPlayersListComponent,
    TeamCommunicationComponent,
    PendingPaymentComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    MaterialModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FlexLayoutModule,
  ],
  exports: [],
  providers: [
    LocationService,
    { provide: RazorPayAPI, useValue: environment.razorPay },
    PaymentService,
  ],
})
export class DashboardModule { }
