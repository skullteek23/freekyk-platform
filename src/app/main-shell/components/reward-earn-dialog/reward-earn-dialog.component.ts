import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IFeatureInfoOptions, FeatureInfoComponent } from '@shared/dialogs/feature-info/feature-info.component';
import { RewardMessage } from '@shared/interfaces/reward.model';
import { REWARDS_HOW_IT_WORKS } from '@shared/web-content/WEBSITE_CONTENT';

export interface IEarnedRewardDialogData {
  points: number;
  activityID: number;
  isAdded: boolean;
  showCTA: boolean;
}

@Component({
  selector: 'app-reward-earn-dialog',
  templateUrl: './reward-earn-dialog.component.html',
  styleUrls: ['./reward-earn-dialog.component.scss']
})
export class RewardEarnDialogComponent implements OnInit, AfterViewInit {

  extendedDesc: string = null;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<RewardEarnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IEarnedRewardDialogData,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (this.data.activityID >= 0) {
      this.extendedDesc = RewardMessage[this.data.activityID];
    }
  }

  ngAfterViewInit(): void { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  claimReward() {
    this.router.navigate(['/games']);
    this.dialog.closeAll();
    this.onCloseDialog();
  }

  openInfo() {
    const data: IFeatureInfoOptions = {
      heading: 'How Rewards Work?',
      multiDescription: [
        { heading: 'Freekyk Rewards Program', description: REWARDS_HOW_IT_WORKS }
      ]
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'fk-dialogs',
      data
    })
  }
}
