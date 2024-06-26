import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from '@shared/services/snackbar.service';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { NotificationBasic } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-invite-players',
  templateUrl: './invite-players.component.html',
  styleUrls: ['./invite-players.component.scss'],
})
export class InvitePlayersComponent implements OnInit {

  readonly COLS = [
    'select',
    'jersey',
    'player',
    'Location',
    'PlayingPos',
  ]

  invitesList: NotificationBasic[] = [];
  players$: Observable<PlayerBasicInfo[]>;
  noPlayers = true;
  isLoaderShown = false;

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

  createInvites(selection: PlayerBasicInfo[]): void {
    this.invitesList = [];
    const tid = sessionStorage.getItem('tid');
    const uid = localStorage.getItem('uid');
    if (selection.length) {
      selection.forEach((selection) => {
        this.invitesList.push({
          read: 0,
          senderID: uid,
          senderName: this.data,
          receiverID: selection.id,
          date: new Date().getTime(),
          type: 1,
          expire: 0,
          receiverName: selection.name,
          parentID: tid
        });
      });
    }
  }

  sendInvites(): void {
    const batch = this.ngFire.firestore.batch();
    if (this.invitesList.length && batch) {
      this.isLoaderShown = true;
      for (const invite of this.invitesList) {
        const colRef = this.ngFire.firestore.collection('notifications').doc();
        batch.set(colRef, invite);
      }
      batch
        .commit()
        .then(() => {
          this.isLoaderShown = false;
          this.snackBarService.displayCustomMsg('Invites sent successfully!');
          this.onCloseDialog();
        })
        .catch(() => {
          this.isLoaderShown = false;
          this.snackBarService.displayError()
        }
        );
    }
  }
}
