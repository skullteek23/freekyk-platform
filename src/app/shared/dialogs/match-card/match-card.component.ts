import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
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
  currIndex: number = 0;
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
  ) {
    this.lineups$ = this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo')
      .doc('matchLineup')
      .get()
      .pipe(map((resp) => <MatchLineup>resp.data()));
    this.stats$ = this.ngFirestore
      .collection('allMatches/' + this.data?.id + '/additionalInfo')
      .doc('matchReport')
      .get()
      .pipe(
        map((resp) => <MatchStats>resp.data()),
        share()
      );
    if (!!data.concluded && data.concluded) {
      this.currIndex = 2;
      this.matchHeaderData = {
        concluded: data.concluded,
        date: data?.date,
        home: {
          name: data?.teams[0],
          imgpathLogo: data?.logos[0],
        },
        away: {
          name: data?.teams[1],
          imgpathLogo: data?.logos[1],
        },
        score: { home: data?.score[0], away: data?.score[1] },
      };
    } else {
      this.matchHeaderData = {
        concluded: data.concluded,
        date: data?.date,
        home: {
          name: data?.teams[0],
          imgpathLogo: data?.logos[0],
        },
        away: {
          name: data?.teams[1],
          imgpathLogo: data?.logos[1],
        },
      };
    }

    this.overViewData$ = ngFirestore
      .collection('allMatches/' + data?.id + '/additionalInfo')
      .doc('matchOverview')
      .get()
      .pipe(map((resp) => <MatchFixtureOverview>resp.data()));
    // .toPromise()
    // .then((doc) => ( = <MatchFixtureOverview>doc.data()));
  }
  ngOnInit(): void {}
  onCloseDialog() {
    this.dialogRef.close();
  }
  getType(typeCode: string) {
    if (typeCode == 'FPL') return 'League Match';
    else if (typeCode == 'FCP') return 'Community Play Match';
    else return 'Knockout Match';
  }

  getDate() {
    return new Date();
  }
  // getStats;
}
