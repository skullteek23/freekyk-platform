import { NgModule } from '@angular/core';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { OnboardingGuard } from './auth/onboarding.guard';
import { SignupGuardGuard } from './auth/signup-guard.guard';
import { SignupComponent } from './auth/signup/signup.component';
import { DashTeamManagComponent } from './dashboard/dash-team-manag/dash-team-manag.component';
import { ErrorComponent } from './error/error.component';
import { ChallengesComponent } from './main-shell/components/challenges/challenges.component';
import { CreateInstantMatchComponent } from './main-shell/components/create-instant-match/create-instant-match.component';
import { CreateTeamDialogComponent } from './main-shell/components/create-team-dialog/create-team-dialog.component';
import { FindPlayersComponent } from './main-shell/components/find-players/find-players.component';
import { GetTeamComponent } from './main-shell/components/get-team/get-team.component';
import { HomeComponent } from './main-shell/components/home/home.component';
import { JoinGamesComponent } from './main-shell/components/join-games/join-games.component';
import { LeaderboardComponent } from './main-shell/components/leaderboard/leaderboard.component';
import { OrganizeSeasonComponent } from './main-shell/components/organize-season/organize-season.component';
import { RewardsComponent } from './main-shell/components/rewards/rewards.component';
import { ViewMatchesComponent } from './main-shell/components/view-matches/view-matches.component';
import { OnboardingComponent } from './main-shell/components/onboarding/onboarding.component';
import { PrivacyComponent } from './others/privacy/privacy.component';
import { TermsComponent } from './others/terms/terms.component';
import { GroundProfileComponent } from './play/profile-pages/ground-profile/ground-profile.component';
import { SeasonProfileComponent } from './play/profile-pages/season-profile/season-profile.component';
import { TeamProfileComponent } from './play/profile-pages/team-profile/team-profile.component';
import { JoinTeamDialogComponent } from './main-shell/components/join-team-dialog/join-team-dialog.component';
import { OnboardUserGuard } from './auth/onboard-user.guard';
import { MyNotificationsComponent } from './main-shell/components/my-notifications/my-notifications.component';
import { PickupGameProfileComponent } from './main-shell/components/pickup-game-profile/pickup-game-profile.component';
import { PlStandingsComponent } from './play/pl-standings/pl-standings.component';
import { MyOrdersComponent } from './main-shell/components/my-orders/my-orders.component';
import { MyAccountComponent } from './main-shell/components/my-account/my-account.component';
import { MyAddressesComponent } from './main-shell/components/my-addresses/my-addresses.component';
import { OrderComponent } from './main-shell/components/order/order.component';
import { EditProfileComponent } from './main-shell/components/edit-profile/edit-profile.component';
import { EarnRewardComponent } from './main-shell/components/earn-reward/earn-reward.component';
import { RedeemRewardComponent } from './main-shell/components/redeem-reward/redeem-reward.component';
import { PurchasePointsComponent } from './main-shell/components/purchase-points/purchase-points.component';
import { GoalsComponent } from './main-shell/components/leaderboard/components/goals/goals.component';
import { PlayedComponent } from './main-shell/components/leaderboard/components/played/played.component';
import { PointsComponent } from './main-shell/components/leaderboard/components/points/points.component';
import { PendingPaymentComponent } from './main-shell/components/pending-payment/pending-payment.component';
import { MyMatchesComponent } from './main-shell/components/my-matches/my-matches.component';
import { FindGroundsComponent } from './main-shell/components/find-grounds/find-grounds.component';

const redirectUnauthorizedGuard = () => redirectUnauthorizedTo(['/signup']);

const routes: Routes = [
  { path: 'home', pathMatch: 'full', redirectTo: '' },
  { path: 'app', pathMatch: 'full', redirectTo: '' },
  { path: '', pathMatch: 'full', component: HomeComponent },

  { path: 'games', component: JoinGamesComponent },
  { path: 'game/:seasonid', component: SeasonProfileComponent },
  {
    path: 'game/:seasonid/pay',
    component: SeasonProfileComponent,
  },
  { path: 'pickup-game/:seasonid', component: PickupGameProfileComponent },
  {
    path: 'pickup-game/:seasonid/pay',
    component: PickupGameProfileComponent,
  },
  {
    path: 'pickup-game/:seasonid/waiting-list',
    component: PickupGameProfileComponent,
  },

  { path: 'matches', component: ViewMatchesComponent },
  { path: 'match/create', component: CreateInstantMatchComponent },
  { path: 'become-organizer', component: OrganizeSeasonComponent },

  { path: 'teams', component: GetTeamComponent },
  {
    path: 'team/create', component: CreateTeamDialogComponent, canActivate: [OnboardUserGuard]
  },
  { path: 'teams/join', component: JoinTeamDialogComponent },
  { path: 'team/:teamid', component: TeamProfileComponent },

  { path: 'grounds', component: FindGroundsComponent },
  { path: 'ground/:groundid', component: GroundProfileComponent },

  { path: 'players', component: FindPlayersComponent },
  { path: 'players/:playerid', component: FindPlayersComponent },
  { path: 'standings', component: PlStandingsComponent },
  { path: 'challenges', component: ChallengesComponent },
  {
    path: 'leaderboard', component: LeaderboardComponent,
    children: [
      { path: 'goals', component: GoalsComponent },
      { path: 'played', component: PlayedComponent },
      { path: 'points', component: PointsComponent },
    ]
  },

  {
    path: 'my-matches', component: MyMatchesComponent,
  },
  {
    path: 'my-team', component: DashTeamManagComponent,
    ...canActivate(redirectUnauthorizedGuard),
    children: [
      { path: 'invite', component: DashTeamManagComponent },
      { path: 'settings', component: DashTeamManagComponent },
      { path: 'gallery', component: DashTeamManagComponent },
    ]
  },

  { path: 'account', component: MyAccountComponent, ...canActivate(redirectUnauthorizedGuard) },
  { path: 'edit-profile', component: EditProfileComponent, ...canActivate(redirectUnauthorizedGuard) },
  { path: 'notifications', component: MyNotificationsComponent, ...canActivate(redirectUnauthorizedGuard) },
  { path: 'orders', component: MyOrdersComponent, ...canActivate(redirectUnauthorizedGuard) },
  { path: 'order/:orderid', component: OrderComponent, ...canActivate(redirectUnauthorizedGuard) },
  { path: 'pending-payments', component: PendingPaymentComponent, ...canActivate(redirectUnauthorizedGuard) },
  { path: 'addresses', component: MyAddressesComponent, ...canActivate(redirectUnauthorizedGuard) },
  {
    path: 'rewards', component: RewardsComponent, ...canActivate(redirectUnauthorizedGuard),
    children: [
      { path: 'earn', component: EarnRewardComponent },
      { path: 'redeem', component: RedeemRewardComponent },
      { path: 'purchase', component: PurchasePointsComponent },
      { path: 'purchase/:amount', component: PurchasePointsComponent },
    ]
  },

  { path: 'signup', component: SignupComponent, canActivate: [SignupGuardGuard] },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [OnboardingGuard] },
  { path: 'login', redirectTo: 'signup' },

  { path: 'privacypolicy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule) },

  {
    path: 'error',
    component: ErrorComponent,
    data: {
      message: 'We are sorry, but the page you requested was not found!',
      code: '404',
    }
  },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule) },
  { path: 'play', loadChildren: () => import('./play/play.module').then((m) => m.PlayModule) },
  { path: '**', redirectTo: 'error' },
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
