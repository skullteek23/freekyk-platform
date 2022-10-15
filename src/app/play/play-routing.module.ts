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
      { path: 'home', component: PlHomeComponent },
      { path: 'seasons', component: PlSeasonsComponent },
      { path: 'players', component: PlPlayersComponent },
      { path: 'teams', component: PlTeamsComponent },
      { path: 'fixtures', component: PlFixturesComponent },
      { path: 'results', component: PlResultsComponent },
      { path: 'standings', component: PlStandingsComponent },
      { path: 'grounds', component: PlGroundsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayRoutingModule { }
