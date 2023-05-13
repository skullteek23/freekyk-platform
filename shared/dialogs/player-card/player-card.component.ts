import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IStatisticsCard } from '@app/dashboard/dash-home/my-stats-card/my-stats-card.component';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { AuthService } from '@app/services/auth.service';
import { SocialShareService } from '@app/services/social-share.service';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss'],
})
export class PlayerCardComponent implements OnInit {

  data: Partial<PlayerAllInfo>;
  stats: IStatisticsCard[] = [];
  teamName = null;

  constructor(
    public dialogRef: MatDialogRef<PlayerCardComponent>,
    private socialShareService: SocialShareService,
    private apiService: ApiGetService,
    private authService: AuthService,
    private rewardService: GenerateRewardService,
    @Inject(MAT_DIALOG_DATA) public docID: string,
  ) { }

  ngOnInit(): void {
    if (this.docID) {
      this.getPlayerInfo();
    }
    this.authService.isLoggedIn().subscribe({
      next: async (user) => {
        if (user) {
          await this.rewardService.completeActivity(RewardableActivities.openPlayerCard, user.uid);
        }
      }
    })
  }

  getPlayerInfo() {
    this.apiService.getPlayerAllInfo(this.docID)
      .subscribe(response => {
        if (response) {
          this.data = response;
          this.parsePlayerStats();
          if (this.data.teamID) {
            this.getTeamName();
          }
        }
      });
  }

  getTeamName() {
    this.apiService.getTeam(this.data.teamID)
      .pipe(map(resp => resp?.name))
      .subscribe({
        next: (response) => {
          if (response) {
            this.teamName = response;
          }
        }
      })
  }

  parsePlayerStats() {
    this.stats = [];
    this.stats.push({ icon: 'sports_soccer', label: 'Apps', value: this.data?.apps || 0 })
    this.stats.push({ icon: 'sports_soccer', label: 'Goals', value: this.data?.g || 0 })
    this.stats.push({ icon: 'flag', label: 'Wins', value: this.data?.w || 0 })
    this.stats.push({ icon: 'style', label: 'Cards', value: this.data?.rcards || 0, iconClass: 'red' })
    this.stats.push({ icon: 'style', label: 'Cards', value: this.data?.ycards || 0, iconClass: 'yellow' })
    this.stats.push({ icon: 'cancel_presentation', label: 'Losses', value: this.data?.l || 0 })
  }

  // onLoadStats(): void {
  //   this.plStats$ = this.ngFire
  //     .collection(`players/${this.docID}/additionalInfo`)
  //     .doc('statistics')
  //     .get()
  //     .pipe(
  //       map((resp) => resp.data() as BasicStats),
  //       map(
  //         (resp) =>
  //         ({
  //           Appearances: resp ? resp.apps : 0,
  //           Wins: resp ? resp.w : 0,
  //           Goals: resp ? resp.g : 0,
  //           'Red Cards': resp ? resp.rcards : 0,
  //           'Yellow Cards': resp ? resp.ycards : 0,
  //         } as Stats)
  //       )
  //     );
  // }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onShare(): void {
    const shareData = new ShareData();
    shareData.share_url = `/play/players/${this.docID}`;
    shareData.share_title = this.data.name;
    this.socialShareService.onShare(shareData);
  }
}
