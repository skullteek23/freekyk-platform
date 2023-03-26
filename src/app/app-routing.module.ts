import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { DashAccountComponent } from './dashboard/dash-account/dash-account.component';
import { MyMatchesComponent } from './dashboard/dash-home/my-matches/my-matches.component';
import { DashTeamManagComponent } from './dashboard/dash-team-manag/dash-team-manag.component';
import { ErrorComponent } from './error/error.component';
import { ChallengesComponent } from './main-shell/components/challenges/challenges.component';
import { CreateInstantMatchComponent } from './main-shell/components/create-instant-match/create-instant-match.component';
import { CreateTeamDialogComponent } from './main-shell/components/create-team-dialog/create-team-dialog.component';
import { FindGroundsComponent } from './main-shell/components/find-grounds/find-grounds.component';
import { FindPlayersComponent } from './main-shell/components/find-players/find-players.component';
import { GetTeamComponent } from './main-shell/components/get-team/get-team.component';
import { HomeComponent } from './main-shell/components/home/home.component';
import { JoinGamesComponent } from './main-shell/components/join-games/join-games.component';
import { LeaderboardComponent } from './main-shell/components/leaderboard/leaderboard.component';
import { OrganizeSeasonComponent } from './main-shell/components/organize-season/organize-season.component';
import { RewardsComponent } from './main-shell/components/rewards/rewards.component';
import { ViewMatchesComponent } from './main-shell/components/view-matches/view-matches.component';
import { PrivacyComponent } from './others/privacy/privacy.component';
import { TermsComponent } from './others/terms/terms.component';
import { GroundProfileComponent } from './play/profile-pages/ground-profile/ground-profile.component';
import { SeasonProfileComponent } from './play/profile-pages/season-profile/season-profile.component';
import { TeamProfileComponent } from './play/profile-pages/team-profile/team-profile.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'games', component: JoinGamesComponent },
  { path: 'game/:seasonid', component: SeasonProfileComponent },
  { path: 'game/:seasonid/pay', component: SeasonProfileComponent },
  { path: 'matches', component: ViewMatchesComponent },
  { path: 'team/:teamid', component: TeamProfileComponent },
  { path: 'ground/:groundid', component: GroundProfileComponent },
  { path: 'teams/create', component: CreateTeamDialogComponent },
  { path: 'players', component: FindPlayersComponent },
  { path: 'grounds', component: FindGroundsComponent },
  { path: 'teams', component: GetTeamComponent },
  { path: 'challenges', component: ChallengesComponent },
  { path: 'create-instant-match', component: CreateInstantMatchComponent },
  { path: 'rewards', component: RewardsComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'become-organizer', component: OrganizeSeasonComponent },
  { path: 'my-matches', component: MyMatchesComponent },
  { path: 'my-team', component: DashTeamManagComponent },
  { path: 'profile', component: DashAccountComponent },
  { path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule) },

  { path: 'signup', component: SignupComponent },
  // { path: 'home', loadChildren: () => import('./main-shell/main-shell.module').then(m => m.MainShellModule) },
  {
    path: 'login',
    redirectTo: 'signup'
  },
  {
    path: 'play',
    loadChildren: () => import('./play/play.module').then((m) => m.PlayModule),
  },
  { path: 'privacypolicy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  // {
  //   path: 'support',
  //   loadChildren: () =>
  //     import('./support/support.module').then((m) => m.SupportModule),
  // },
  // { path: 'p/:playerid', component: PlayerProfileComponent },
  // { path: 't/:teamid', component: TeamProfileComponent },
  // { path: 's/:seasonid', component: SeasonProfileComponent },
  // { path: 'about', component: AboutComponent },
  // { path: 'privacypolicy', component: PrivacyComponent },
  // { path: 'terms', component: TermsComponent },

  {
    path: 'error',
    component: ErrorComponent,
    data: {
      message: 'We are sorry, but the page you requested was not found!',
      code: '404',
    },
  },
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
