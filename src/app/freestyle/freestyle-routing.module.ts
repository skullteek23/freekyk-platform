import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FreestyleComponent } from './freestyle.component';
import { FsContestsComponent } from './fs-contests/fs-contests.component';
import { FsFreestylersComponent } from './fs-freestylers/fs-freestylers.component';
import { FsHomeComponent } from './fs-home/fs-home.component';
import { FsLeaderboardComponent } from './fs-leaderboard/fs-leaderboard.component';
import { FreestylerProfileComponent } from './profile-pages/freestyler-profile/freestyler-profile.component';

const routes: Routes = [
  {
    path: '',
    component: FreestyleComponent,
    children: [{ path: 'home', component: FsHomeComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreestyleRoutingModule {}
