import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IEarnedRewardDialogData, RewardEarnDialogComponent } from '../components/reward-earn-dialog/reward-earn-dialog.component';
import { ICompletedActivity, IPoint, IPointsLog, LogType, RewardMessage, RewardPoints } from '@shared/interfaces/reward.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class GenerateRewardService {

  constructor(
    private dialog: MatDialog,
    private apiPostService: ApiPostService,
    private apiService: ApiGetService,
  ) {
  }

  private openRewardDialog(data: IEarnedRewardDialogData): Promise<any> {
    const dialogRef = this.dialog.open(RewardEarnDialogComponent, {
      disableClose: false,
      data
    });
    return dialogRef.afterClosed().toPromise();
  }

  private addActivityPoints(activityID: number, uid: string): void {
    const points = RewardPoints[activityID];
    const update = {
      points: firebase.firestore.FieldValue.increment(points)
    }
    const log: IPointsLog = {
      timestamp: new Date().getTime(),
      points,
      uid,
      type: LogType.credit,
      entity: RewardMessage[activityID],
    }
    const completedActivity: ICompletedActivity = {
      activityID,
      timestamp: new Date().getTime(),
      uid
    }

    this.apiPostService.setUserPointsForActivity(uid, update, log, completedActivity)
      .then(() => {
        const data: IEarnedRewardDialogData = {
          points,
          activityID,
          isAdded: false
        }
        this.openRewardDialog(data);
      });
  }

  addPoints(addCount: number, uid: string, entity: any): void {
    const update = {
      points: firebase.firestore.FieldValue.increment(addCount)
    }
    const log: IPointsLog = {
      timestamp: new Date().getTime(),
      points: addCount,
      uid,
      type: LogType.credit,
      entity,
    }

    this.apiPostService.setUserPoints(uid, update, log)
      .then(() => {
        const data: IEarnedRewardDialogData = {
          points: addCount,
          activityID: null,
          isAdded: false
        }
        this.openRewardDialog(data);
      });
  }

  async completeActivity(activityID: number, uid: string): Promise<any> {
    if (activityID >= 0 && uid) {
      const isActivityCompleted = await this.apiService.isActivityCompleted(activityID, uid).toPromise();
      if (!isActivityCompleted) {
        this.addActivityPoints(activityID, uid);
      }
    }
  }
}
