import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayComponent } from './play.component';
import { PlayRoutingModule } from './play-routing.module';
import { PlHomeComponent } from './pl-home/pl-home.component';
import { PlSeasonsComponent } from './pl-seasons/pl-seasons.component';
import { PlPlayersComponent } from './pl-players/pl-players.component';
import { PlTeamsComponent } from './pl-teams/pl-teams.component';
import { PlFixturesComponent } from './pl-fixtures/pl-fixtures.component';
import { PlResultsComponent } from './pl-results/pl-results.component';
import { SharedModule } from '@shared/shared.module';
import { PlGroundsComponent } from './pl-grounds/pl-grounds.component';
import { MaterialModule } from '@shared/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    PlayComponent,
    PlHomeComponent,
    PlSeasonsComponent,
    PlPlayersComponent,
    PlTeamsComponent,
    PlFixturesComponent,
    PlResultsComponent,
    PlGroundsComponent,
  ],
  imports: [
    MaterialModule,
    CommonModule,
    SharedModule,
    PlayRoutingModule,
    FlexLayoutModule,
  ],
  exports: [],
})
export class PlayModule { }
