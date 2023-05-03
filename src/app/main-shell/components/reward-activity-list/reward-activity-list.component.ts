import { Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ActivityListOption, ICompletedActivity, RewardActivityDescription, RewardActivityRoutes, RewardPoints, RewardableActivities } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reward-activity-list',
  templateUrl: './reward-activity-list.component.html',
  styleUrls: ['./reward-activity-list.component.scss']
})
export class RewardActivityListComponent implements OnInit {

  @Output() activityChange = new Subject<void>();

  userID: string = null;
  activitiesList: ActivityListOption[] = [];

  constructor(
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

  openActivity(option: ActivityListOption) {
    if (option.route) {
      if (option.route.includes('#')) {
        const newRoute = option.route.split('#')[0];
        const fragment = option.route.split('#')[1];
        this.router.navigate([newRoute], { fragment });
      } else {
        this.router.navigate([option.route]);
      }
      this.activityChange.next();
    }
  }

}
