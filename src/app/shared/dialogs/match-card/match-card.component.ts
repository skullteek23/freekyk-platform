import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { MatchFixtureOverview, MatchFixture, MatchLineup, MatchDayReport } from '../../interfaces/match.model';
import { matchData } from '../../interfaces/others.model';

@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css'],
})
export class MatchCardComponent implements OnInit {

  awayTeam = '';
  homeTeam = '';
  lineups: MatchLineup;
  matchHeaderData: matchData;
  overViewData: MatchFixtureOverview;
  statsData: MatchDayReport;
  selectedIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<MatchCardComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: MatchFixture,
    private ngFirestore: AngularFirestore
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.getOverviewData();
      this.getMatchLineup();
      this.setMatchHeaderData();
      if (this.data.concluded) {
        this.selectedIndex = 2;
        this.getMatchReport();
      }
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  getOverviewData(): void {
    this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo').doc('matchOverview')
      .get()
      .pipe(map((resp) => resp.data() as MatchFixtureOverview))
      .subscribe(response => {
        this.overViewData = response;
        this.homeTeam = this.data.home.name;
        this.awayTeam = this.data.away.name;
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
      });
  }

  setMatchHeaderData(): void {
    this.matchHeaderData = {
      concluded: this.data.concluded,
      date: this.data?.date,
      home: {
        name: this.data?.home?.name,
        imgpathLogo: this.data?.home?.logo,
      },
      away: {
        name: this.data?.away?.name,
        imgpathLogo: this.data?.away?.logo,
      },
    };
    if (this.data?.concluded) {
      this.matchHeaderData.score = {
        home: this.data?.home?.score,
        away: this.data?.away?.score
      };
      if (this.data?.tie_breaker) {
        this.matchHeaderData.penalties = this.data?.tie_breaker;
      }
    }
  }
}
