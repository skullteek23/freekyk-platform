import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { ActivityListOption } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { FREEKYK_REWARDS_DESCRIPTION } from '@shared/web-content/WEBSITE_CONTENT';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {

  userPoints = 0;
  isLoaderShown = false;
  activitiesList: ActivityListOption[] = []

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private apiGetService: ApiGetService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user) {
          this.getUserPoints(user.uid);
        }
      }
    })
  }

  getUserPoints(uid: string) {
    this.isLoaderShown = true;
    this.apiGetService.getUserPoints(uid).subscribe({
      next: response => {
        if (response?.points >= 0) {
          this.userPoints = response.points;
        }
        this.isLoaderShown = false;
      },
      error: () => {
        this.isLoaderShown = false;
      }
    })
  }

  openInfo() {
    const data: IFeatureInfoOptions = {
      heading: 'How Rewards Work?',
      multiDescription: [
        {
          subheading: 'Freekyk Rewards Program',
          description: FREEKYK_REWARDS_DESCRIPTION
        }
      ]
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'fk-dialogs',
      data
    })
  }
}
