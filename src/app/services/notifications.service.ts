import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { take, map, tap, filter } from 'rxjs/operators';
import {
  NotificationBasic,
  Invite,
} from '../shared/interfaces/notification.model';
import { SnackbarService } from './snackbar.service';
import { InviteAcceptCardComponent } from '../dashboard/dialogs/invite-accept-card/invite-accept-card.component';
import { SendinviteComponent } from '../dashboard/dialogs/sendinvite/sendinvite.component';
import { DashState } from '../dashboard/store/dash.reducer';
import { checkProfileComplete } from './team.service';
import { InvitePlayersComponent } from '../dashboard/dialogs/invite-players/invite-players.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService implements OnDestroy {
  notifications: NotificationBasic[] = [];
  notifsChanged = new BehaviorSubject<NotificationBasic[]>(this.notifications);
  notifsCountChanged = new BehaviorSubject<number>(0);
  emptyInvites = new BehaviorSubject<boolean>(true);
  subscriptions = new Subscription();
  onSendNotif(
    recieverId: string,
    notif: NotificationBasic
  ): Promise<DocumentReference<unknown>> {
    return this.ngFire
      .collection('players/' + recieverId + '/Notifications')
      .add(notif);
  }
  onSelNotif(notif: NotificationBasic): void {
    switch (notif.type) {
      case 'team welcome':
        this.router.navigate(['/dashboard', 'team-management']);
        break;
      case 'request':
        this.sendTeamInviteByNotif(notif);
        break;
      case 'invite':
        this.openTeamOffer(notif.id, notif.senderName);
        break;
      case 'team challenge':
        this.router.navigate(['/dashboard', 'participate']);
        break;

      default:
        this.snackServ.displayError();
        break;
    }
  }
  getNotifications(): NotificationBasic[] {
    return this.notifications.slice();
  }
  deleteNotification(notifId: string): void {
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection('players/' + uid + '/Notifications')
      .doc(notifId)
      .delete();
  }
  deleteInvite(invId: string): void {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(
          tap((resp) => {
            if (!!resp.isCaptain === false) {
              this.snackServ.displayCustomMsg(
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
            .then(() => this.snackServ.displayDelete())
        )
    );
  }
  async sendTeamInviteByInv(inv: Invite): Promise<any> {
    if (inv.status !== 'reject') {
      this.snackServ.displayCustomMsg(
        'Only invites rejected by player can be resent!'
      );
    } else {
      const newInvite: Invite = {
        teamId: inv.teamId,
        teamName: inv.teamName,
        inviteeId: inv.inviteeId,
        inviteeName: inv.inviteeName,
        status: 'wait',
      };
      this.ngFire
        .collection('invites')
        .doc()
        .set(newInvite)
        .then(() => this.snackServ.displayCustomMsg('Invite Sent!'));
    }
  }
  async sendTeamInviteByNotif(data: NotificationBasic): Promise<any> {
    const dialogRef = this.dialog.open(SendinviteComponent, {
      data: { name: data.senderName, id: data.senderId },
      autoFocus: false,
      restoreFocus: false,
    });
    this.subscriptions.add(
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((response) => {
          if (response) {
            this.deleteNotification(data.id);
            this.subscriptions.add(
              this.store
                .select('dash')
                .pipe(
                  take(1),
                  map((val) => val.hasTeam)
                )
                .subscribe((info) => {
                  if (info != null) {
                    const newInvite: Invite = {
                      teamId: info.id,
                      teamName: info.name,
                      inviteeId: data.senderId,
                      inviteeName: data.senderName,
                      status: 'wait',
                    };
                    this.ngFire.collection('invites').doc().set(newInvite);
                  }
                })
            );
          }
        })
    );
  }
  async openTeamOffer(id: string, teamName: string): Promise<any> {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(map(checkProfileComplete), take(1))
        .subscribe((data) => {
          if (data === 1) {
            this.snackServ.displayCustomMsg(
              'Complete your profile to proceed!'
            );
          } else if (data === 2) {
            this.snackServ.displayCustomMsg('Upload your Photo to proceed!');
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
                .subscribe((response: 'accept' | 'reject' | null) => {
                  return this.updTeamInviteByNotif(response, id);
                })
            );
          }
        })
    );
  }
  fetchAndGetAllNotifs(uid: string): Observable<NotificationBasic[]> {
    return this.ngFire
      .collection('players/' + uid + '/Notifications', (query) =>
        query.orderBy('date', 'asc')
      )
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
  fetchInvites(uid: string): Observable<Invite[]> {
    return this.ngFire
      .collection('invites', (query) => query.where('inviteeId', '==', uid))
      .snapshotChanges()
      .pipe(
        map((responseData) => {
          this.emptyInvites.next(responseData.length === 0);
          return responseData.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as Invite),
            } as Invite)
          );
        })
      );
  }
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
    // notif id is same as invite id for team invites
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
        .collection('players/' + pid + '/Notifications', (query) =>
          query.orderBy('date', 'asc').limit(8)
        )
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
          this.notifsCountChanged.next(this.notifications.length);
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
              this.snackServ.displayCustomMsg(
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
  constructor(
    private ngFire: AngularFirestore,
    private dialog: MatDialog,
    private router: Router,
    private snackServ: SnackbarService,
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
}
