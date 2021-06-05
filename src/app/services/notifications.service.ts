import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
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
export class NotificationsService {
  notifications: NotificationBasic[] = [];
  notifsChanged = new BehaviorSubject<NotificationBasic[]>(this.notifications);
  notifsCountChanged = new BehaviorSubject<number>(0);
  emptyInvites = new BehaviorSubject<boolean>(true);
  onSendNotif(recieverId: string, notif: NotificationBasic) {
    return this.ngFire
      .collection('players/' + recieverId + '/Notifications')
      .add(notif);
  }
  onSelNotif(notif: NotificationBasic) {
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
        this.router.navigate(['/dashboard', 'premium']);
        break;

      default:
        this.snackServ.displayError();
        break;
    }
  }
  getNotifications() {
    return this.notifications.slice();
  }
  deleteNotification(notifId: string) {
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection('players/' + uid + '/Notifications')
      .doc(notifId)
      .delete();
  }
  deleteInvite(invId: string) {
    this.store
      .select('dash')
      .pipe(
        tap((resp) => {
          if (!!resp.isCaptain == false)
            this.snackServ.displayCustomMsg(
              'Only a Captain can perform this action!'
            );
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
      );
  }
  async sendTeamInviteByInv(inv: Invite) {
    if (inv.status != 'reject')
      this.snackServ.displayCustomMsg(
        'Only invites rejected by player can be resent!'
      );
    else {
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
  async sendTeamInviteByNotif(data: NotificationBasic) {
    const dialogRef = this.dialog.open(SendinviteComponent, {
      data: { name: data.senderName, id: data.senderId },
      autoFocus: false,
      restoreFocus: false,
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((response) => {
        if (response == true) {
          this.deleteNotification(data.id);
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
            });
        }
      });
  }
  async openTeamOffer(id: string, teamName: string) {
    this.store
      .select('dash')
      .pipe(map(checkProfileComplete), take(1))
      .subscribe((data) => {
        if (data == 1)
          this.snackServ.displayCustomMsg('Complete your profile to proceed!');
        else if (data == 2)
          this.snackServ.displayCustomMsg('Upload your Photo to proceed!');
        else {
          const dialogRef = this.dialog.open(InviteAcceptCardComponent, {
            data: teamName,
            autoFocus: false,
            restoreFocus: false,
          });
          dialogRef
            .afterClosed()
            .pipe(
              map((resp) =>
                resp != 'accept' && resp != 'reject' ? null : resp
              ),
              tap((resp) =>
                resp == 'accept'
                  ? this.router.navigate(['/dashboard', 'team-management'])
                  : null
              )
            )
            .subscribe((response: 'accept' | 'reject' | null) => {
              return this.updTeamInviteByNotif(response, id);
            });
        }
      });
  }
  fetchAndGetAllNotifs(uid: string) {
    return this.ngFire
      .collection('players/' + uid + '/Notifications', (query) =>
        query.orderBy('date', 'asc')
      )
      .snapshotChanges()
      .pipe(
        map((resp) => {
          if (resp.length == 0) return [];
          let newResp: NotificationBasic[] = [];
          resp.forEach((notif) => {
            newResp.push({
              id: notif.payload.doc.id,
              ...(<NotificationBasic>notif.payload.doc.data()),
            });
          });
          return newResp;
        })
      );
  }
  fetchInvites(uid: string) {
    return this.ngFire
      .collection('invites', (query) => query.where('inviteeId', '==', uid))
      .snapshotChanges()
      .pipe(
        map((responseData) => {
          console.log(responseData);
          this.emptyInvites.next(responseData.length == 0);
          if (responseData.length == 0) return [];
          let invites: Invite[] = [];
          responseData.forEach((element) => {
            invites.push({
              id: element.payload.doc.id,
              ...(<Invite>element.payload.doc.data()),
            });
          });
          return invites;
        })
      );
  }
  async callUpdateTeamInvite(
    statusUpdate: 'wait' | 'accept' | 'reject' | null,
    invId: string
  ) {
    this.updTeamInviteByNotif(statusUpdate, invId);
  }
  private async updTeamInviteByNotif(
    statusUpdate: 'wait' | 'accept' | 'reject' | null,
    notifId: string
  ) {
    //notif id is same as invite id for team invites
    if (statusUpdate == null) return;
    return await this.ngFire.collection('invites').doc(notifId).update({
      status: statusUpdate,
    });
  }
  private fetchtNotifications(pid: string) {
    this.ngFire
      .collection('players/' + pid + '/Notifications', (query) =>
        query.orderBy('date', 'asc').limit(8)
      )
      .snapshotChanges()
      .pipe(
        map((resp) => {
          if (resp.length == 0) return [];
          let newResp: NotificationBasic[] = [];
          resp.forEach((notif) => {
            newResp.push({
              id: notif.payload.doc.id,
              ...(<NotificationBasic>notif.payload.doc.data()),
            });
          });
          return newResp;
        })
      )
      .subscribe((notifs) => {
        this.notifications = notifs;
        this.notifsChanged.next(this.notifications.slice());
        this.notifsCountChanged.next(this.notifications.length);
      });
  }
  onOpenInvitePlayersDialog() {
    this.store
      .select('dash')
      .pipe(
        tap((resp) => {
          if (!resp.isCaptain)
            this.snackServ.displayCustomMsg(
              'Only a Captain can perform this action!'
            );
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
      });
  }
  constructor(
    private ngFire: AngularFirestore,
    private dialog: MatDialog,
    private router: Router,
    private snackServ: SnackbarService,
    private store: Store<{ dash: DashState }>
  ) {
    const uid = localStorage.getItem('uid');
    if (uid) this.fetchtNotifications(uid);
  }
}
