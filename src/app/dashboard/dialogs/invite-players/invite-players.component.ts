import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Invite } from '@shared/interfaces/notification.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ArraySorting } from '@shared/utils/array-sorting';

@Component({
  selector: 'app-invite-players',
  templateUrl: './invite-players.component.html',
  styleUrls: ['./invite-players.component.scss'],
})
export class InvitePlayersComponent implements OnInit {
  invitesList: Invite[] = [];
  players$: Observable<PlayerBasicInfo[]>;
  noPlayers = true;
  constructor(
    public dialogRef: MatDialogRef<InvitePlayersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private ngFire: AngularFirestore,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getPlayers();
  }
  onCloseDialog(): void {
    this.dialogRef.close();
  }
  getPlayers(): void {
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
            ({
              id: doc.id,
              ...(doc.data() as PlayerBasicInfo),
            } as PlayerBasicInfo)
          )
        ),
        map((docs) => docs.filter((doc) => doc.id !== uid)),
        map(resp => resp.sort(ArraySorting.sortObjectByKey('name')))
      );
  }
  onSendInvites(plSelected: MatListOption[]): void {
    this.createInvites(plSelected.map((sel) => sel.value));
  }
  createInvites(selArray: { name: string; id: string }[]): void {
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
  sendInvites(): void {
    if (this.invitesList.length > 1) {
      const batch = this.ngFire.firestore.batch();
      for (const invite of this.invitesList) {
        const newId = this.ngFire.createId();
        const colRef = this.ngFire.firestore.collection('invites').doc(newId);
        batch.set(colRef, invite);
      }
      batch
        .commit()
        .then(() => {
          this.snackBarService.displayCustomMsg('Invites sent successfully!');
          this.onCloseDialog();
        })
        .catch(() => this.snackBarService.displayError());
      // .catch((error) => console.log(error));
    } else {
      this.ngFire.firestore
        .collection('invites')
        .add(this.invitesList[0])
        .then(() => {
          this.snackBarService.displayCustomMsg('Invites sent successfully!');
          this.onCloseDialog();
        })
        .catch(() => this.snackBarService.displayError());
      // .catch((error) => console.log(error));
    }
  }
}
