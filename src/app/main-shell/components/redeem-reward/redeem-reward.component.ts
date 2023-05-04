import { Component, OnInit } from '@angular/core';
import { RewardService } from '@app/main-shell/services/reward.service';
import { IReward } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-redeem-reward',
  templateUrl: './redeem-reward.component.html',
  styleUrls: ['./redeem-reward.component.scss']
})
export class RedeemRewardComponent implements OnInit {

  rewardsList: IReward[] = [];
  userPoints = 0;

  constructor(
    private rewardService: RewardService,
    private apiGetService: ApiGetService
  ) { }

  ngOnInit(): void {
    this.rewardService._points().subscribe(points => {
      this.userPoints = points;
    });
  }

  openReward(reward: IReward) {
    console.log(reward);
  }

  getRewards() {
    this.showLoader();
    this.apiGetService.getRewards().subscribe({
      next: (response) => {
        if (response) {
          response.map(el => {
            el.progress = 1 - ((this.userPoints / el.valuePoints) * 100);
          });
          this.rewardsList = response;
        }
        this.hideLoader();
      },
      error: () => {
        this.rewardsList = [];
        this.hideLoader();
      }
    })
  }

  showLoader() {
    this.rewardService.showLoader();
  }

  hideLoader() {
    this.rewardService.hideLoader();
  }

}
