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
import { SharedModule } from '../shared/shared.module';
import { PlStLeagueComponent } from './pl-standings/pl-st-league/pl-st-league.component';
import { PlStKnockoutComponent } from './pl-standings/pl-st-knockout/pl-st-knockout.component';
import { PlStCommunityPlayComponent } from './pl-standings/pl-st-community-play/pl-st-community-play.component';
import { KnockoutSmComponent } from './pl-standings/pl-st-knockout/knockout-sm/knockout-sm.component';
import { PlGroundsComponent } from './pl-grounds/pl-grounds.component';
import { PlayMaterialModule } from './play-material.module';
import { KnockoutStripComponent } from './pl-standings/pl-st-knockout/knockout-strip/knockout-strip.component';

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
    PlStLeagueComponent,
    PlStKnockoutComponent,
    PlStCommunityPlayComponent,
    KnockoutSmComponent,
    PlGroundsComponent,
    KnockoutStripComponent,
  ],
  imports: [SharedModule, PlayMaterialModule, PlayRoutingModule],
  exports: [],
})
export class PlayModule {}
