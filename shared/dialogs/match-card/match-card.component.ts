import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { MatchFixtureOverview, MatchFixture, MatchLineup, MatchDayReport, MatchStatus } from '../../interfaces/match.model';
import { ListOption } from '../../interfaces/others.model';
import { ViewGroundCardComponent } from '../view-ground-card/view-ground-card.component';

@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.scss'],
})
export class MatchCardComponent implements OnInit {

  lineups: MatchLineup;
  overViewData: MatchFixtureOverview;
  statsData: MatchDayReport;
  selectedIndex = 0;
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
        this.getOverviewData();
        this.getMatchLineup();
        if (this.data.status === MatchStatus.STU || this.data.status === MatchStatus.STD) {
          this.getMatchReport();
        }
      });
  }

  getOverviewData(): void {
    this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo').doc('matchOverview')
      .get()
      .pipe(map((resp) => resp.data() as MatchFixtureOverview))
      .subscribe(response => {
        this.overViewData = response;
      });
  }

  getMatchLineup(): void {
    this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo')
      .doc('matchLineup')
      .get()
      .pipe(map((resp) => resp.exists ? resp.data() as MatchLineup : null))
      .subscribe(response => {
        if (response) {
          this.lineups = response;
        }
      });
  }

  getMatchReport(): void {
    this.ngFirestore
      .collection('matchReports')
      .doc(this.data.id)
      .get()
      .pipe(map((resp) => resp.data() as MatchDayReport))
      .subscribe(response => {
        this.statsData = response;
        this.selectedIndex = 2
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
}
