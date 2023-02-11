import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';

export interface IJoinTeamDialogData {
  requestHeading: string;
  requestMessage: string;
  team?: {
    name: string;
    captain: string;
  };
  player?: {
    name: string;
    uid: string
  }
}

@Component({
  selector: 'app-join-team-request-dialog',
  templateUrl: './join-team-request-dialog.component.html',
  styleUrls: ['./join-team-request-dialog.component.scss']
})
export class JoinTeamRequestDialogComponent implements OnInit {

  playerInfo: PlayerBasicInfo = null;
  teamInfo: TeamBasicInfo = null;

  constructor(
    public dialogRef: MatDialogRef<JoinTeamRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IJoinTeamDialogData,
    private ngFire: AngularFirestore,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    if (this.data?.player?.uid) {
      this.getPlayerInfo();
    } else if (this.data?.team.name) {
      this.getTeamInfo();
    }
  }

  getPlayerInfo() {
    this.ngFire.collection('players').doc(this.data.player.uid).get()
      .subscribe(response => {
        this.playerInfo = response?.exists ? response.data() as PlayerBasicInfo : null;
        if (!this.playerInfo) {
          this.snackBarService.displayError('Player Profile is either deleted or removed!');
          this.closeDialog(0);
        }
      })
  }

  getTeamInfo() {
    this.ngFire.collection('teams', query => query.where('tname', '==', this.data.team.name)).get()
      .subscribe(response => {
        this.teamInfo = !response?.empty ? response.docs[0].data() as TeamBasicInfo : null;
        if (!this.teamInfo) {
          this.snackBarService.displayError('Team is either deleted or removed!');
          this.closeDialog(0);
        }
      })
  }

  closeDialog(value = null) {
    this.dialogRef.close(value);
  }

  accept() {
    this.closeDialog(1);
  }

  reject() {
    this.closeDialog(0);
  }

}
