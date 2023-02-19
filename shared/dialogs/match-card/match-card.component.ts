import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamMembers, Tmember } from '@shared/interfaces/team.model';
import { map } from 'rxjs/operators';
import { MatchFixtureOverview, MatchFixture, MatchLineup, MatchDayReport, MatchStatus } from '../../interfaces/match.model';
import { ListOption } from '../../interfaces/others.model';
import { PlayerCardComponent } from '../player-card/player-card.component';
import { ViewGroundCardComponent } from '../view-ground-card/view-ground-card.component';

@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.scss'],
})
export class MatchCardComponent implements OnInit {

  homeLineup: Tmember[] = [];
  awayLineup: Tmember[] = [];
  statsData: MatchDayReport;
  data: MatchFixture;

  constructor(
    public dialogRef: MatDialogRef<MatchCardComponent>,
    @Inject(MAT_DIALOG_DATA) public matchID: string,
    private ngFirestore: AngularFirestore,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (this.matchID) {
      this.getFixtureData();
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  getFixtureData() {
    this.ngFirestore
      .collection('allMatches').doc(this.matchID)
      .get()
      .pipe(map((resp) => (resp.data() as MatchFixture)))
      .subscribe(response => {
        this.data = response;
        this.getMatchLineup();
        if (this.data.status === MatchStatus.STU || this.data.status === MatchStatus.STD) {
          this.getMatchReport();
        }
      });
  }

  async getMatchLineup(): Promise<any> {
    const homeData = (await this.ngFirestore.collection('teams', query => query.where('tname', '==', this.data.home.name)).get().toPromise());
    const awayData = (await this.ngFirestore.collection('teams', query => query.where('tname', '==', this.data.away.name)).get().toPromise());
    if (!homeData?.empty && homeData?.docs[0]?.exists) {
      const membersList: Tmember[] = ((await this.ngFirestore.collection(`teams/${homeData?.docs[0].id}/additionalInfo`).doc('members').get().toPromise()).data() as TeamMembers).members;
      this.homeLineup = membersList;
    } else {
      this.homeLineup = [];
    }
    if (!awayData?.empty && awayData?.docs[0]?.exists) {
      const membersList: Tmember[] = ((await this.ngFirestore.collection(`teams/${awayData?.docs[0].id}/additionalInfo`).doc('members').get().toPromise()).data() as TeamMembers).members
      this.awayLineup = membersList;
    } else {
      this.awayLineup = [];
    }
  }

  getMatchReport(): void {
    this.ngFirestore
      .collection('matchReports')
      .doc(this.data.id)
      .get()
      .pipe(map((resp) => resp.data() as MatchDayReport))
      .subscribe(response => {
        this.statsData = response;
      });
  }

  OnOpenGround() {
    const data: ListOption = {
      viewValue: this.data.ground,
      value: this.data.groundID
    }
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  onOpenPlayerProfile(pid: string): void {
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: pid,
    });
  }
}
