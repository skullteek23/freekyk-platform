import { NgModule } from '@angular/core';
import { FreestyleRoutingModule } from './freestyle-routing.module';
import { FreestyleComponent } from './freestyle.component';
import { FsHomeComponent } from './fs-home/fs-home.component';
import { FsFreestylersComponent } from './fs-freestylers/fs-freestylers.component';
import { FsLeaderboardComponent } from './fs-leaderboard/fs-leaderboard.component';
import { FsContestsComponent } from './fs-contests/fs-contests.component';
import { FreestylerProfileComponent } from './profile-pages/freestyler-profile/freestyler-profile.component';
import { SharedModule } from '../shared/shared.module';
import { FsLbTableComponent } from './fs-leaderboard/fs-lb-table/fs-lb-table.component';
import { FsCoStageComponent } from './fs-contests/fs-co-stage/fs-co-stage.component';
import { FsCoStageFinalComponent } from './fs-contests/fs-co-stage-final/fs-co-stage-final.component';

@NgModule({
  declarations: [
    FreestyleComponent,
    FsHomeComponent,
    FsFreestylersComponent,
    FsLeaderboardComponent,
    FsContestsComponent,
    FreestylerProfileComponent,
    FsLbTableComponent,
    FsCoStageComponent,
    FsCoStageFinalComponent,
  ],
  imports: [SharedModule, FreestyleRoutingModule],
  exports: [],
})
export class FreestyleModule {}
