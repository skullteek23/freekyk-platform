import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { RewardService } from '@app/main-shell/services/reward.service';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { MatchConstants } from '@shared/constants/constants';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { ListOption } from '@shared/interfaces/others.model';
import { IReward } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { REWARDS_HOW_IT_WORKS } from '@shared/web-content/WEBSITE_CONTENT';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss'],
  providers: [DatePipe]
})
export class RewardsComponent implements OnInit, OnDestroy {

  userPoints = 0;
  isLoaderShown = false;
  activeLink = '';
  subscriptions = new Subscription();
  links: ListOption[] = [
    { viewValue: 'Earn', value: '/rewards/earn' },
    { viewValue: 'Redeem', value: '/rewards/redeem' },
    { viewValue: 'Purchase', value: '/rewards/purchase' },
  ];
  user: authUserMain = null;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private apiGetService: ApiGetService,
    private router: Router,
    private rewardService: RewardService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activeLink = event.url.slice('/rewards/'.length);
          window.scrollTo(0, 0);
        }
      })
    )
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user) {
          this.user = user;
          this.getUserPoints();
        }
      }
    });
    this.rewardService._loading().subscribe({
      next: (status) => {
        if (status) {
          this.showLoader();
        } else {
          this.hideLoader();
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getUserPoints() {
    this.showLoader();
    this.apiGetService.getUserPoints(this.user.uid).subscribe({
      next: response => {
        if (response?.points >= 0) {
          this.userPoints = response.points;
          this.rewardService.setPoints(this.userPoints);
        }
        this.hideLoader();
      },
      error: () => {
        this.hideLoader();
      }
    })
  }

  openInfo() {
    const data: IFeatureInfoOptions = {
      heading: 'How Rewards Work?',
      multiDescription: [
        { subheading: 'Freekyk Rewards Program', description: REWARDS_HOW_IT_WORKS }
      ]
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'fk-dialogs',
      data
    })
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }
}
