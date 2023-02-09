import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { take, map, tap, filter } from 'rxjs/operators';
import {
  NotificationBasic,
  NotificationTypes,
} from '@shared/interfaces/notification.model';
import { SnackbarService } from './snackbar.service';
import { InviteAcceptCardComponent } from '../dashboard/dialogs/invite-accept-card/invite-accept-card.component';
import { DashState } from '../dashboard/store/dash.reducer';
import { checkProfileComplete } from './team.service';
import { InvitePlayersComponent } from '../dashboard/dialogs/invite-players/invite-players.component';
import { IJoinTeamDialogData, JoinTeamRequestDialogComponent } from '@app/dashboard/dialogs/join-team-request-dialog/join-team-request-dialog.component';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService implements OnDestroy {
  notifications: NotificationBasic[] = [];
  notifsChanged = new BehaviorSubject<NotificationBasic[]>(this.notifications);
  notifsCountChanged = new BehaviorSubject<number>(0);
  emptyInvites = new BehaviorSubject<boolean>(true);
  subscriptions = new Subscription();

  requestAcceptLoadingStatus = new Subject<boolean>();

  constructor(
    private ngFire: AngularFirestore,
    private ngFunctions: AngularFireFunctions,
    private dialog: MatDialog,
    private router: Router,
    private snackBarService: SnackbarService,
    private store: Store<{ dash: DashState }>
  ) {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.fetchtNotifications(uid);
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onSelectNotification(notification: NotificationBasic): void {
    if (notification.expire === 1) {
      this.snackBarService.displayCustomMsg('This notification is expired!');
      return;
    }
    this.changeStatus(notification, 1);
    switch (notification.type) {
      case NotificationTypes.teamWelcome:
        this.router.navigate(['/dashboard', 'team-management']);
        break;
      case NotificationTypes.playerJoinRequest:
        this.openPlayerRequestDialog(notification);
        break;
      case NotificationTypes.captainJoinInvite:
        this.openCaptainRequestDialog(notification);
        break;

      default:
        this.snackBarService.displayError('This notification is expired');
        break;
    }
  }

  openPlayerRequestDialog(notification: NotificationBasic) {
    const data: IJoinTeamDialogData = {
      requestHeading: 'Add Player to team',
      requestMessage: 'Are you sure you want to add this player to your team?',
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
        if (response) {
          const tid = sessionStorage.getItem('tid');
          if (tid) {
            const data = {
              teamID: tid,
              playerID: notification?.senderID,
            }
            this.requestAcceptLoadingStatus.next(true);
            const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.JOIN_TEAM);
            callable(data)
              .toPromise()
              .then(() => {
                this.markExpired(notification.id);
                this.requestAcceptLoadingStatus.next(false);
                this.snackBarService.displayCustomMsg('Player added successfully!');
                this.router.navigate(['/dashboard', 'team-management']);
              })
              .catch(error => {
                this.requestAcceptLoadingStatus.next(false);
                this.snackBarService.displayError(error?.message)
              })
          }
        }
      })

  }

  openCaptainRequestDialog(notification: NotificationBasic) {
    const captainName = sessionStorage.getItem('name');
    const data: IJoinTeamDialogData = {
      requestHeading: 'Join team',
      requestMessage: 'Are you sure you want to join this team?',
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
        if (response) {
          const data = {
            teamID: notification?.senderID,
            playerID: notification?.receiverID,
          }

          this.requestAcceptLoadingStatus.next(true);
          const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.JOIN_TEAM);
          callable(data)
            .toPromise()
            .then(() => {
              this.markExpired(notification.id);
              this.requestAcceptLoadingStatus.next(false);
              this.snackBarService.displayCustomMsg('Team joined successfully!');
              this.router.navigate(['/dashboard', 'team-management']);
            })
            .catch(error => {
              this.requestAcceptLoadingStatus.next(false);
              this.snackBarService.displayError(error?.message)
            })
        }
      })
  }

  getNotifications(): NotificationBasic[] {
    return this.notifications.slice();
  }

  markExpired(notifId: string): void {
    const update: Partial<NotificationBasic> = {};
    update.expire = 1;
    this.ngFire
      .collection('notifications')
      .doc(notifId)
      .update({ ...update });
  }

  changeStatus(notification: NotificationBasic, status: number): void {
    this.ngFire
      .collection('notifications')
      .doc(notification.id)
      .update({ read: status });
  }

  deleteInvite(invId: string): void {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(
          tap((resp) => {
            if (!!resp.isCaptain === false) {
              this.snackBarService.displayCustomMsg(
                'Only a Captain can perform this action!'
              );
            }
          }),
          map((resp) => resp.isCaptain),
          filter((resp) => !!resp),
          take(1)
        )
        .subscribe(() =>
          this.ngFire
            .collection('invites')
            .doc(invId)
            .delete()
            .then(() => this.snackBarService.displayCustomMsg('Invite deleted successfully!'))
        )
    );
  }

  // async sendTeamInviteByInv(inv: Invite): Promise<any> {
  //   if (inv.status !== 'reject') {
  //     this.snackBarService.displayCustomMsg(
  //       'Only invites rejected by player can be resent!'
  //     );
  //   } else {
  //     const newInvite: Invite = {
  //       teamId: inv.teamId,
  //       teamName: inv.teamName,
  //       inviteeId: inv.inviteeId,
  //       inviteeName: inv.inviteeName,
  //       status: 'wait',
  //     };
  //     this.ngFire
  //       .collection('invites')
  //       .doc()
  //       .set(newInvite)
  //       .then(() => this.snackBarService.displayCustomMsg('Invite Sent!'));
  //   }
  // }

  // async sendTeamInviteByNotif(data: NotificationBasic): Promise<any> {
  //   const dialogRef = this.dialog.open(SendinviteComponent, {
  //     data: { name: data.senderName, id: data.senderId },
  //     autoFocus: false,
  //     restoreFocus: false,
  //   });
  //   this.subscriptions.add(
  //     dialogRef
  //       .afterClosed()
  //       .pipe(take(1))
  //       .subscribe((response) => {
  //         if (response) {
  //           this.deleteNotification(data.id);
  //           this.subscriptions.add(
  //             this.store
  //               .select('dash')
  //               .pipe(
  //                 take(1),
  //                 map((val) => val.hasTeam)
  //               )
  //               .subscribe((info) => {
  //                 if (info != null) {
  //                   const newInvite: Invite = {
  //                     teamId: info.id,
  //                     teamName: info.name,
  //                     inviteeId: data.senderId,
  //                     inviteeName: data.senderName,
  //                     status: 'wait',
  //                   };
  //                   this.ngFire.collection('invites').doc().set(newInvite);
  //                 }
  //               })
  //           );
  //         }
  //       })
  //   );
  // }

  async openTeamOffer(id: string, teamName: string): Promise<any> {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(map(checkProfileComplete), take(1))
        .subscribe((data) => {
          if (data === 1) {
            this.snackBarService.displayCustomMsg(
              'Complete your profile to proceed!'
            );
          } else if (data === 2) {
            this.snackBarService.displayCustomMsg('Upload your Photo to proceed!');
          } else {
            const dialogRef = this.dialog.open(InviteAcceptCardComponent, {
              data: teamName,
              autoFocus: false,
              restoreFocus: false,
            });
            this.subscriptions.add(
              dialogRef
                .afterClosed()
                .pipe(
                  map((resp) =>
                    resp !== 'accept' && resp !== 'reject' ? null : resp
                  ),
                  tap((resp) =>
                    resp === 'accept'
                      ? this.router.navigate(['/dashboard', 'team-management'])
                      : null
                  )
                )
                .subscribe((response: 'accept' | 'reject' | null) => this.updTeamInviteByNotif(response, id))
            );
          }
        })
    );
  }

  fetchAndGetAllNotifs(uid: string): Observable<NotificationBasic[]> {
    return this.ngFire
      .collection('notifications', query => query.where('receiverID', '==', uid))
      .snapshotChanges()
      .pipe(
        map((resp) =>
          resp.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as NotificationBasic),
            } as NotificationBasic)
          )
        )
      );
  }

  // fetchInvites(uid: string): Observable<Invite[]> {
  //   return this.ngFire
  //     .collection('invites', (query) => query.where('inviteeId', '==', uid))
  //     .snapshotChanges()
  //     .pipe(
  //       map((responseData) => {
  //         this.emptyInvites.next(responseData.length === 0);
  //         return responseData.map(
  //           (doc) =>
  //           ({
  //             id: doc.payload.doc.id,
  //             ...(doc.payload.doc.data() as Invite),
  //           } as Invite)
  //         );
  //       })
  //     );
  // }

  async callUpdateTeamInvite(
    statusUpdate: 'wait' | 'accept' | 'reject' | null,
    invId: string
  ): Promise<any> {
    this.updTeamInviteByNotif(statusUpdate, invId);
  }

  private async updTeamInviteByNotif(
    statusUpdate: 'wait' | 'accept' | 'reject' | null,
    notifId: string
  ): Promise<any> {
    // notification id is same as invite id for team invites
    if (statusUpdate == null) {
      return;
    }
    return await this.ngFire.collection('invites').doc(notifId).update({
      status: statusUpdate,
    });
  }

  private fetchtNotifications(pid: string): void {
    this.subscriptions.add(
      this.ngFire
        .collection('notifications', query => query.where('receiverID', '==', pid))
        .snapshotChanges()
        .pipe(
          map((resp) =>
            resp.map(
              (doc) =>
              ({
                id: doc.payload.doc.id,
                ...(doc.payload.doc.data() as NotificationBasic),
              } as NotificationBasic)
            )
          )
        )
        .subscribe((notifs) => {
          this.notifications = notifs;
          this.notifsChanged.next(this.notifications.slice());
          this.notifsCountChanged.next(this.notifications.filter(el => !el.read).length);
        })
    );
  }

  onOpenInvitePlayersDialog(): void {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(
          tap((resp) => {
            if (!resp.isCaptain) {
              this.snackBarService.displayCustomMsg(
                'Only a Captain can perform this action!'
              );
            }
          }),
          filter((resp) => resp.isCaptain),
          map((resp) => resp.hasTeam.name),
          take(1)
        )
        .subscribe((tname) => {
          this.dialog.open(InvitePlayersComponent, {
            panelClass: 'large-dialogs',
            disableClose: true,
            data: tname,
          });
        })
    );
  }
}
