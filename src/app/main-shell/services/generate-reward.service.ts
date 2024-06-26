import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IEarnedRewardDialogData, RewardEarnDialogComponent } from '../components/reward-earn-dialog/reward-earn-dialog.component';
import { ICompletedActivity, IPointsLog, LogType, RewardMessage, RewardPoints } from '@shared/interfaces/reward.model';
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
  ) { }

  openRewardDialog(data: IEarnedRewardDialogData): Promise<any> {
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
          isAdded: false,
          showCTA: true,
        }
        this.openRewardDialog(data);
      });
  }

  addPoints(addCount: number, uid: string, entity: any): Promise<any> {
    if (addCount <= 0 || !addCount) {
      return null;
    }
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

    return this.apiPostService.setUserPoints(uid, update, log);
  }

  subtractPoints(subtractCount: number, uid: string, entity: any): Promise<any> {
    if (subtractCount <= 0 || !subtractCount) {
      return null;
    }
    const update = {
      points: firebase.firestore.FieldValue.increment(-subtractCount)
    }
    const log: IPointsLog = {
      timestamp: new Date().getTime(),
      points: subtractCount,
      uid,
      type: LogType.debit,
      entity,
    }

    return this.apiPostService.setUserPoints(uid, update, log);
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
