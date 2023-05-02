import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationBasic, NotificationTypes, } from '@shared/interfaces/notification.model';
import { SnackbarService } from './snackbar.service';
import { IJoinTeamDialogData, JoinTeamRequestDialogComponent } from '@app/dashboard/dialogs/join-team-request-dialog/join-team-request-dialog.component';
import { ApiPostService } from '@shared/services/api.service';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { RewardableActivities } from '@shared/interfaces/reward.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private snackBarService: SnackbarService,
    private apiPostService: ApiPostService,
    private generateRewardService: GenerateRewardService
  ) { }

  onSelectNotification(notification: NotificationBasic): void {
    if (notification.expire === 1) {
      this.snackBarService.displayCustomMsg('This notification is expired!');
      return;
    }
    this.generateRewardService.completeActivity(RewardableActivities.openNotification, notification.receiverID);
    this.changeStatus(notification, 1);
    switch (notification.type) {
      case NotificationTypes.teamWelcome:
        this.router.navigate(['/my-team']);
        break;
      case NotificationTypes.playerJoinRequest:
        this.openPlayerRequestDialog(notification);
        break;
      case NotificationTypes.captainJoinInvite:
        this.openCaptainRequestDialog(notification);
        break;
      case NotificationTypes.teamRejectInvite:
        this.snackBarService.displayCustomMsg('Your invite was rejected by team captain!');
        break;
      case NotificationTypes.playerRejectInvite:
        this.snackBarService.displayCustomMsg('Your invite was rejected by player!');
        break;
      case NotificationTypes.playerAcceptInvite:
        this.snackBarService.displayCustomMsg('Player is added to your team list');
        this.router.navigate(['/my-team']);
        break;
    }
  }

  openPlayerRequestDialog(notification: NotificationBasic) {
    const data: IJoinTeamDialogData = {
      requestHeading: 'Add Player to team',
      requestMessage: `${notification.senderName} wants to join your team. Are you sure?`,
      player: {
        uid: notification?.senderID,
        name: notification?.senderName
      }
    }
    const dialogRef = this.dialog.open(JoinTeamRequestDialogComponent, {
      data,
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      panelClass: 'fk-dialogs'
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        // if (response === 1) {
        //   // captain accepts invite
        //   const tid = sessionStorage.getItem('tid');
        //   if (tid) {
        //     const data = {
        //       teamID: tid,
        //       playerID: notification?.senderID,
        //     }
        //     const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.JOIN_TEAM);
        //     callable(data)
        //       .toPromise()
        //       .then(() => {
        //         this.markExpired(notification.id);
        //         this.snackBarService.displayCustomMsg('Player added successfully!');
        //         this.router.navigate(['/my-team']);
        //       })
        //       .catch(error => {
        //         this.requestAcceptLoadingStatus.next(false);
        //         this.snackBarService.displayError(error?.message)
        //       })
        //   }
        // } else if (response === 0) {
        //   // captain rejects invite
        //   const rejectNotification: NotificationBasic = {
        //     read: 0,
        //     senderID: notification.receiverID,
        //     senderName: notification.receiverName,
        //     receiverID: notification.senderID,
        //     receiverName: notification.senderName,
        //     date: new Date().getTime(),
        //     type: NotificationTypes.teamRejectInvite,
        //     expire: 0,
        //   };
        //   this.markExpired(notification.id);
        //   this.sendNotification(rejectNotification);
        // }
      })

  }

  // sendNotification(notification: NotificationBasic) {
  //   return this.ngFire.collection('notifications').add(notification)
  //     .then(() => this.snackBarService.displayCustomMsg(`${notification.receiverName} will be notified soon!`))
  //     .catch(error => this.snackBarService.displayError('Notification send failed!'));
  // }

  openCaptainRequestDialog(notification: NotificationBasic) {
    const captainName = sessionStorage.getItem('name');
    const data: IJoinTeamDialogData = {
      requestHeading: 'Join team',
      requestMessage: `Team ${notification.senderName}'s captain wants you to join their team. Are you sure?`,
      team: {
        name: notification.senderName,
        captain: captainName
      }
    }
    const dialogRef = this.dialog.open(JoinTeamRequestDialogComponent, {
      data,
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      panelClass: 'fk-dialogs'
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        // if (response) {
        //   // user accepts invite
        //   const data = {
        //     teamID: notification?.parentID ? notification?.parentID : notification?.senderID,
        //     playerID: notification?.receiverID,
        //   };

        //   this.requestAcceptLoadingStatus.next(true);
        //   const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.JOIN_TEAM);
        //   callable(data)
        //     .toPromise()
        //     .then(() => {
        //       this.markExpired(notification.id);
        //       this.requestAcceptLoadingStatus.next(false);
        //       this.snackBarService.displayCustomMsg('Team joined successfully!');
        //       this.router.navigate(['/my-team']);
        //     })
        //     .catch(error => {
        //       this.requestAcceptLoadingStatus.next(false);
        //       this.snackBarService.displayError(error?.message)
        //     })
        // } else if (response === 0) {

        //   // user rejects invite
        //   const rejectNotification: NotificationBasic = {
        //     read: 0,
        //     senderID: notification.receiverID,
        //     senderName: notification.receiverName,
        //     receiverID: notification.senderID ? notification.senderID : notification.parentID,
        //     receiverName: notification.senderName,
        //     date: new Date().getTime(),
        //     type: NotificationTypes.playerRejectInvite,
        //     expire: 0,
        //   };
        //   this.markExpired(notification.id);
        //   this.sendNotification(rejectNotification);
        // }
      })
  }

  // getNotifications(): NotificationBasic[] {
  //   return this.notifications.slice();
  // }

  markExpired(notifId: string): void {
    const update: Partial<NotificationBasic> = {};
    update.expire = 1;
    this.apiPostService.updateNotification(notifId, update);
  }

  changeStatus(notification: NotificationBasic, status: number): void {
    this.apiPostService.updateNotification(notification.id, { read: status });
  }

  sendNotification(notification: NotificationBasic) {
    return this.apiPostService.addNotification(notification);
  }
}
