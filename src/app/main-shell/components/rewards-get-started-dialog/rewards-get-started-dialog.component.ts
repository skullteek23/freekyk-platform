import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ListOption } from '@shared/interfaces/others.model';
import { ICompletedActivity, RewardActivityDescription, RewardActivityRoutes, RewardPoints, RewardableActivities } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { FREEKYK_REWARDS_DESCRIPTION } from '@shared/web-content/WEBSITE_CONTENT';

interface ActivityListOption {
  points: number;
  description: string;
  route?: string;
}

@Component({
  selector: 'app-rewards-get-started-dialog',
  templateUrl: './rewards-get-started-dialog.component.html',
  styleUrls: ['./rewards-get-started-dialog.component.scss']
})
export class RewardsGetStartedDialogComponent implements OnInit {

  readonly content = FREEKYK_REWARDS_DESCRIPTION;

  userID: string = null;
  activitiesList: ActivityListOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<RewardsGetStartedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public points: number,
    private authService: AuthService,
    private apiService: ApiGetService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user?.uid) {
          this.userID = user.uid;
          this.getCompletedActivities();
        }
      },
      error: () => {
        this.userID = null;
      }
    })
  }

  getCompletedActivities() {
    this.apiService.getUserCompletedActivities(this.userID).subscribe({
      next: (response) => {
        if (response) {
          this.createActivities(response);
        }
      }
    })
  }

  createActivities(response: ICompletedActivity[]) {
    const activityList = Object.values(RewardableActivities).filter(value => typeof value === "number");
    this.activitiesList = [];
    const tempArray = activityList.filter(activityA => !response.some(activityB => activityB.activityID === activityA));
    tempArray.forEach(element => {
      this.activitiesList.push({
        points: RewardPoints[element],
        description: RewardActivityDescription[element],
        route: RewardActivityRoutes[element]
      })
    });

  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  openActivity(option: ActivityListOption) {
    if (option.route) {
      if (option.route.includes('#')) {
        const newRoute = option.route.split('#')[0];
        const fragment = option.route.split('#')[1];
        this.router.navigate([newRoute], { fragment });
      } else {
        this.router.navigate([option.route]);
      }
      this.onCloseDialog();
    }
  }

  signup() {
    this.router.navigate(['/signup'], { queryParams: { callback: encodeURIComponent('/rewards') } });
    this.onCloseDialog();
  }

}
