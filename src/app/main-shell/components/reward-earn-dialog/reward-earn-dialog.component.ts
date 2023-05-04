import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RewardMessage } from '@shared/interfaces/reward.model';

export interface IEarnedRewardDialogData {
  points: number;
  activityID: number;
  isAdded: boolean;
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
    @Inject(MAT_DIALOG_DATA) public data: IEarnedRewardDialogData
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
    this.router.navigate(['/rewards']);
    this.onCloseDialog();
  }

  learnMore() {
    this.router.navigate(['/rewards']);
    this.onCloseDialog();
  }
}
