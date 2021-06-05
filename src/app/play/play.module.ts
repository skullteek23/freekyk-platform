import { NgModule } from '@angular/core';
import { PlayComponent } from './play.component';
import { PlayRoutingModule } from './play-routing.module';
import { PlHomeComponent } from './pl-home/pl-home.component';
import { PlSeasonsComponent } from './pl-seasons/pl-seasons.component';
import { PlPlayersComponent } from './pl-players/pl-players.component';
import { PlTeamsComponent } from './pl-teams/pl-teams.component';
import { PlFixturesComponent } from './pl-fixtures/pl-fixtures.component';
import { PlResultsComponent } from './pl-results/pl-results.component';
import { PlStandingsComponent } from './pl-standings/pl-standings.component';
import { PlayerProfileComponent } from './profile-pages/player-profile/player-profile.component';
import { TeamProfileComponent } from './profile-pages/team-profile/team-profile.component';
import { SeasonProfileComponent } from './profile-pages/season-profile/season-profile.component';
import { SharedModule } from '../shared/shared.module';
import { PlStLeagueComponent } from './pl-standings/pl-st-league/pl-st-league.component';
import { PlStKnockoutComponent } from './pl-standings/pl-st-knockout/pl-st-knockout.component';
import { PlStCommunityPlayComponent } from './pl-standings/pl-st-community-play/pl-st-community-play.component';
import { KnockoutSmComponent } from './pl-standings/pl-st-knockout/knockout-sm/knockout-sm.component';
import { TeOverviewComponent } from './profile-pages/team-profile/te-overview/te-overview.component';
import { TeMembersComponent } from './profile-pages/team-profile/te-members/te-members.component';
import { TeGalleryComponent } from './profile-pages/team-profile/te-gallery/te-gallery.component';
import { TeStatsComponent } from './profile-pages/team-profile/te-stats/te-stats.component';
import { SeOverviewComponent } from './profile-pages/season-profile/se-overview/se-overview.component';
import { PlGroundsComponent } from './pl-grounds/pl-grounds.component';
import { GroundProfileComponent } from './profile-pages/ground-profile/ground-profile.component';
import { PlayMaterialModule } from './play-material.module';
import { SeGalleryComponent } from './profile-pages/season-profile/se-gallery/se-gallery.component';
import { SeStatsComponent } from './profile-pages/season-profile/se-stats/se-stats.component';

@NgModule({
  declarations: [
    PlayComponent,
    PlHomeComponent,
    PlSeasonsComponent,
    PlPlayersComponent,
    PlTeamsComponent,
    PlFixturesComponent,
    PlResultsComponent,
    PlStandingsComponent,
    PlayerProfileComponent,
    TeamProfileComponent,
    SeasonProfileComponent,
    PlStLeagueComponent,
    PlStKnockoutComponent,
    PlStCommunityPlayComponent,
    KnockoutSmComponent,
    TeOverviewComponent,
    TeMembersComponent,
    TeGalleryComponent,
    TeStatsComponent,
    SeOverviewComponent,
    PlGroundsComponent,
    GroundProfileComponent,
    SeGalleryComponent,
    SeStatsComponent,
  ],
  imports: [SharedModule, PlayMaterialModule, PlayRoutingModule],
  exports: [],
})
export class PlayModule {}
