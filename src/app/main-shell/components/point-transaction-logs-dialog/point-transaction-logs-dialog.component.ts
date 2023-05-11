import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RewardService } from '@app/main-shell/services/reward.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { ApiGetService } from '@shared/services/api.service';

export interface ILogListItem {
  points: number;
  details: string;
  timestamp: number;
  class: string;
}

@Component({
  selector: 'app-point-transaction-logs-dialog',
  templateUrl: './point-transaction-logs-dialog.component.html',
  styleUrls: ['./point-transaction-logs-dialog.component.scss']
})
export class PointTransactionLogsDialogComponent implements OnInit {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;

  isLoaderShown = false;
  logs: ILogListItem[] = [];

  constructor(
    private apiGetService: ApiGetService,
    private snackbarService: SnackbarService,
    private rewardService: RewardService,
    public dialogRef: MatDialogRef<PointTransactionLogsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userID: string,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.userID) {
      this.getTransactionLogs();
    }
  }

  getTransactionLogs() {
    this.showLoader();
    this.apiGetService.getUserPointLogs(this.userID).subscribe({
      next: (response) => {
        this.logs = this.rewardService.parseLogs(response);
        this.hideLoader();
      },
      error: () => {
        this.hideLoader();
        this.snackbarService.displayError('Error: Unable to get transaction logs!')
      }
    })
  }

  onCloseDialog() {
    this.dialogRef.close()
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
    this.dialogRef.close();
  }

}
