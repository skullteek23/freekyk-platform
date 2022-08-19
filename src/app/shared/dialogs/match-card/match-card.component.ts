import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import {
  MatchFixtureOverview,
  MatchFixture,
  MatchLineup,
  MatchStats,
} from '../../interfaces/match.model';

@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css'],
})
export class MatchCardComponent implements OnInit {
  overViewData$: Observable<MatchFixtureOverview>;
  currIndex = 0;
  lineups$: Observable<MatchLineup>;
  stats$: Observable<MatchStats>;
  matchHeaderData: {
    date: firebase.firestore.Timestamp;
    concluded: boolean;
    home: { imgpathLogo: string; name: string };
    away: { imgpathLogo: string; name: string };
    score?: { home: number; away: number };
  };
  constructor(
    public dialogRef: MatDialogRef<MatchCardComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: MatchFixture,
    // private shareServ: ShareLinkService,
    private ngFirestore: AngularFirestore
  ) { }
  ngOnInit(): void {
    this.lineups$ = this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo')
      .doc('matchLineup')
      .get()
      .pipe(map((resp) => resp.data() as MatchLineup));
    this.stats$ = this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo')
      .doc('matchReport')
      .get()
      .pipe(
        map((resp) => resp.data() as MatchStats),
        share()
      );
    if (!!this.data.concluded && this.data.concluded) {
      this.currIndex = 2;
      this.matchHeaderData = {
        concluded: this.data.concluded,
        date: this.data?.date,
        home: {
          name: this.data?.home.name,
          imgpathLogo: this.data?.home.logo,
        },
        away: {
          name: this.data?.away.name,
          imgpathLogo: this.data?.away.logo,
        },
        score: { home: this.data?.home.score, away: this.data?.away.score },
      };
    } else {
      this.matchHeaderData = {
        concluded: this.data.concluded,
        date: this.data?.date,
        home: {
          name: this.data?.home.name,
          imgpathLogo: this.data?.home.logo,
        },
        away: {
          name: this.data?.away.name,
          imgpathLogo: this.data?.away.logo,
        },
      };
    }

    this.overViewData$ = this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo')
      .doc('matchOverview')
      .get()
      .pipe(map((resp) => resp.data() as MatchFixtureOverview));
  }
  onCloseDialog(): void {
    this.dialogRef.close();
  }
  getType(typeCode: string): string {
    if (typeCode === 'FPL') {
      return 'League Match';
    } else if (typeCode === 'FCP') {
      return 'Community Play Match';
    } else {
      return 'Knockout Match';
    }
  }

  getDate(): Date {
    return new Date();
  }
  // getStats;
}
