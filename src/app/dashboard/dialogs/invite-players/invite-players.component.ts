import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Invite } from 'src/app/shared/interfaces/notification.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-invite-players',
  templateUrl: './invite-players.component.html',
  styleUrls: ['./invite-players.component.css'],
})
export class InvitePlayersComponent implements OnInit {
  invitesList: Invite[] = [];
  players$: Observable<PlayerBasicInfo[]>;
  noPlayers: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<InvitePlayersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {}

  ngOnInit(): void {
    this.getPlayers();
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  getPlayers() {
    const uid = localStorage.getItem('uid');
    this.players$ = this.ngFire
      .collection('players')
      .get()
      .pipe(
        tap((resp) => {
          this.noPlayers = resp.empty;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <PlayerBasicInfo>{ id: doc.id, ...(<PlayerBasicInfo>doc.data()) }
          )
        ),
        map((docs) => docs.filter((doc) => doc.id != uid))
      );
  }
  onSendInvites(plSelected: MatListOption[]) {
    this.createInvites(plSelected.map((sel) => sel.value));
  }
  createInvites(selArray: { name: string; id: string }[]) {
    const tid = sessionStorage.getItem('tid');
    selArray.forEach((selection) => {
      this.invitesList.push({
        teamId: tid,
        teamName: this.data,
        inviteeId: selection.id,
        inviteeName: selection.name,
        status: 'wait',
      });
    });
    this.sendInvites();
  }
  sendInvites() {
    if (this.invitesList.length > 1) {
      var batch = this.ngFire.firestore.batch();
      for (let i = 0; i < this.invitesList.length; i++) {
        const newId = this.ngFire.createId();
        const colRef = this.ngFire.firestore.collection('invites').doc(newId);
        batch.set(colRef, this.invitesList[i]);
      }
      batch
        .commit()
        .then(() => {
          this.snackServ.displayCustomMsg('Invites sent successfully!');
          this.onCloseDialog();
        })
        .catch((error) => console.log(error));
    } else {
      this.ngFire.firestore
        .collection('invites')
        .add(this.invitesList[0])
        .then(() => {
          this.snackServ.displayCustomMsg('Invites sent successfully!');
          this.onCloseDialog();
        })
        .catch((error) => console.log(error));
    }
  }
}