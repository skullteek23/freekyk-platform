import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteLinks } from '../shared/Constants/ROUTE_LINKS';
import { PlFixturesComponent } from './pl-fixtures/pl-fixtures.component';
import { PlGroundsComponent } from './pl-grounds/pl-grounds.component';
import { PlHomeComponent } from './pl-home/pl-home.component';
import { PlPlayersComponent } from './pl-players/pl-players.component';
import { PlResultsComponent } from './pl-results/pl-results.component';
import { PlSeasonsComponent } from './pl-seasons/pl-seasons.component';
import { PlStandingsComponent } from './pl-standings/pl-standings.component';
import { PlTeamsComponent } from './pl-teams/pl-teams.component';
import { PlayComponent } from './play.component';

const routes: Routes = [
  {
    path: '',
    component: PlayComponent,
    children: [
      { path: RouteLinks.PLAY[0], component: PlHomeComponent },
      { path: RouteLinks.PLAY[1], component: PlSeasonsComponent },
      { path: RouteLinks.PLAY[2], component: PlPlayersComponent },
      { path: RouteLinks.PLAY[3], component: PlTeamsComponent },
      { path: RouteLinks.PLAY[4], component: PlFixturesComponent },
      { path: RouteLinks.PLAY[5], component: PlResultsComponent },
      { path: RouteLinks.PLAY[6], component: PlStandingsComponent },
      { path: RouteLinks.PLAY[7], component: PlGroundsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayRoutingModule {}
