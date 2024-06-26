import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/material.module';
import { JoinGamesComponent } from './components/join-games/join-games.component';
import { GetTeamComponent } from './components/get-team/get-team.component';
import { ChallengesComponent } from './components/challenges/challenges.component';
import { RewardsComponent } from './components/rewards/rewards.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { OrganizeSeasonComponent } from './components/organize-season/organize-season.component';
import { CreateInstantMatchComponent } from './components/create-instant-match/create-instant-match.component';
import { FindPlayersComponent } from './components/find-players/find-players.component';
import { FindGroundsComponent } from './components/find-grounds/find-grounds.component';
import { ViewMatchesComponent } from './components/view-matches/view-matches.component';
import { TermsComponent } from '@app/others/terms/terms.component';
import { PrivacyComponent } from '@app/others/privacy/privacy.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateTeamDialogComponent } from './components/create-team-dialog/create-team-dialog.component';
import { PhotoUploadingCircleComponent } from './components/photo-uploading-circle/photo-uploading-circle.component';
import { MyMatchesComponent } from './components/my-matches/my-matches.component';
import { RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { JoinTeamDialogComponent } from './components/join-team-dialog/join-team-dialog.component';
import { PickupGameProfileComponent } from './components/pickup-game-profile/pickup-game-profile.component';
import { WaitingListDialogComponent } from './components/waiting-list-dialog/waiting-list-dialog.component';
import { FooterComponent } from '@app/footer/footer.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { MyAddressesComponent } from './components/my-addresses/my-addresses.component';
import { OrderComponent } from './components/order/order.component';
import { SelectQuantityComponent } from './components/select-quantity/select-quantity.component';
import { RewardEarnDialogComponent } from './components/reward-earn-dialog/reward-earn-dialog.component';
import { RewardsGetStartedDialogComponent } from './components/rewards-get-started-dialog/rewards-get-started-dialog.component';
import { MyNotificationsComponent } from './components/my-notifications/my-notifications.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RewardActivityListComponent } from './components/reward-activity-list/reward-activity-list.component';
import { EarnRewardComponent } from './components/earn-reward/earn-reward.component';
import { RedeemRewardComponent } from './components/redeem-reward/redeem-reward.component';
import { PurchasePointsComponent } from './components/purchase-points/purchase-points.component';
import { GoalsComponent } from './components/leaderboard/components/goals/goals.component';
import { PlayedComponent } from './components/leaderboard/components/played/played.component';
import { PointsComponent } from './components/leaderboard/components/points/points.component';
import { LeaderboardTableComponent } from './components/leaderboard/components/leaderboard-table/leaderboard-table.component';
import { PaymentOptionsPickupGameComponent } from './components/payment-options-pickup-game/payment-options-pickup-game.component';
import { PointTransactionLogsDialogComponent } from './components/point-transaction-logs-dialog/point-transaction-logs-dialog.component';
import { PendingPaymentComponent } from './components/pending-payment/pending-payment.component';
@NgModule({
  declarations: [
    HomeComponent,
    JoinGamesComponent,
    GetTeamComponent,
    ChallengesComponent,
    RewardsComponent,
    LeaderboardComponent,
    OrganizeSeasonComponent,
    CreateInstantMatchComponent,
    FindPlayersComponent,
    FindGroundsComponent,
    ViewMatchesComponent,
    PrivacyComponent,
    TermsComponent,
    CreateTeamDialogComponent,
    PhotoUploadingCircleComponent,
    MyMatchesComponent,
    GameComponent,
    OnboardingComponent,
    JoinTeamDialogComponent,
    PickupGameProfileComponent,
    WaitingListDialogComponent,
    FooterComponent,
    MyOrdersComponent,
    MyAccountComponent,
    MyAddressesComponent,
    OrderComponent,
    SelectQuantityComponent,
    RewardEarnDialogComponent,
    RewardsGetStartedDialogComponent,
    MyNotificationsComponent,
    EditProfileComponent,
    ProfileComponent,
    RewardActivityListComponent,
    EarnRewardComponent,
    RedeemRewardComponent,
    PurchasePointsComponent,
    GoalsComponent,
    PlayedComponent,
    PointsComponent,
    LeaderboardTableComponent,
    PaymentOptionsPickupGameComponent,
    PointTransactionLogsDialogComponent,
    PendingPaymentComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [
    HomeComponent,
    JoinGamesComponent,
    GetTeamComponent,
    ChallengesComponent,
    RewardsComponent,
    LeaderboardComponent,
    OrganizeSeasonComponent,
    CreateInstantMatchComponent,
    FindPlayersComponent,
    FindGroundsComponent,
    ViewMatchesComponent,
    PrivacyComponent,
    TermsComponent,
    CreateTeamDialogComponent,
    PhotoUploadingCircleComponent,
    MyMatchesComponent,
    GameComponent,
    OnboardingComponent
  ]
})
export class MainShellModule { }
