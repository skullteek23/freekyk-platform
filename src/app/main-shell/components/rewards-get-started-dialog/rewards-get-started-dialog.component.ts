import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ActivityListOption, ICompletedActivity, RewardActivityDescription, RewardActivityRoutes, RewardPoints, RewardableActivities } from '@shared/interfaces/reward.model';
import { ApiGetService } from '@shared/services/api.service';
import { FREEKYK_REWARDS_DESCRIPTION } from '@shared/web-content/WEBSITE_CONTENT';



@Component({
  selector: 'app-rewards-get-started-dialog',
  templateUrl: './rewards-get-started-dialog.component.html',
  styleUrls: ['./rewards-get-started-dialog.component.scss']
})
export class RewardsGetStartedDialogComponent implements OnInit {

  readonly content = FREEKYK_REWARDS_DESCRIPTION;

  userID: string = null;

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
        }
      },
      error: () => {
        this.userID = null;
      }
    })
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  signup() {
    this.router.navigate(['/signup'], { queryParams: { callback: encodeURIComponent('/rewards') } });
    this.onCloseDialog();
  }

}
