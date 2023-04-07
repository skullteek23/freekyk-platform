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
import { ReactiveFormsModule } from '@angular/forms';
import { CreateTeamDialogComponent } from './components/create-team-dialog/create-team-dialog.component';
import { PhotoUploadingCircleComponent } from './components/photo-uploading-circle/photo-uploading-circle.component';
import { MyMatchesComponent } from './components/my-matches/my-matches.component';
import { RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { JoinTeamDialogComponent } from './components/join-team-dialog/join-team-dialog.component';
import { PickupGameProfileComponent } from './components/pickup-game-profile/pickup-game-profile.component';

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
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
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
