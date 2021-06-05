import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';
import { TeamCommunicationService } from 'src/app/services/team-communication.service';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
  ActiveSquadMember,
  MemberResponseNotification,
} from 'src/app/shared/interfaces/team.model';
import { TeamState } from '../store/team.reducer';
import { TeamCommState } from './store/teamComm.reducer';
@Component({
  selector: 'app-da-te-communication',
  templateUrl: './da-te-communication.component.html',
  styleUrls: ['./da-te-communication.component.css'],
})
export class DaTeCommunicationComponent implements OnInit {
  noMatch = 0;
  currMatch = 0;
  upmMatches: MatchFixture[] = [];
  activeTeamActivity: MemberResponseNotification[] = [];
  currSelectedMatch$: Observable<MatchFixture>;
  activeSquad$: Observable<ActiveSquadMember[]>;
  activeMatch$: Observable<MatchFixture>;
  storeSub$: Observable<MatchFixture[]>;
  captainStatus$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private store: Store<{ team: TeamState }>,
    private commServ: TeamCommunicationService,
    private ngFire: AngularFirestore
  ) {}
  ngOnInit(): void {
    this.storeSub$ = this.store.select('team').pipe(
      tap(() => {
        const tid = sessionStorage.getItem('tid');
        console.log('upper storesub');
        this.activeSquad$ = this.ngFire
          .collection('teamCommunications')
          .doc(tid)
          .collection('activeSquad1')
          .valueChanges()
          .pipe(
            // tap((resp) => console.log(resp)),
            map((resp) =>
              resp != null || resp != undefined ? <ActiveSquadMember[]>resp : []
            )
          );
      }),
      tap((resp) => (this.noMatch = resp.upcomingMatches.length)),
      map((resp) => resp.upcomingMatches.slice(0, 3)),
      tap((resp) => (this.currSelectedMatch$ = of(resp[0])))
    );

    // this.currSelectedMatch$ = this.store.select('team').pipe(map(resp => resp[0]))

    this.captainStatus$ = this.store.select('team').pipe(
      map((resp) => resp.basicInfo.captainId == localStorage.getItem('uid')),
      take(1)
    );

    this.store
      .select('team')
      .pipe(
        tap((resp) => (this.noMatch = resp.upcomingMatches.length)),
        map((resp) => resp.upcomingMatches),
        map((resp) => (this.upmMatches = resp.slice(0, 3))),
        tap((resp) => (this.currSelectedMatch$ = of(resp[0]))),
        tap(() => {
          this.commServ.setSelectedMatch(0);
        })
      )
      .subscribe();
  }
  getSquad(sqNumber: number) {
    this.commServ.getActiveSquad(sqNumber);
  }
  onChangeTab(newTabNumber: MatTabChangeEvent) {
    this.storeSub$
      .pipe(
        map((resp) => (this.currSelectedMatch$ = of(resp[newTabNumber.index]))),
        tap((resp) => {
          this.commServ.setSelectedMatch(newTabNumber.index);
          this.commServ.getActiveSquad(newTabNumber.index);
        })
      )
      .subscribe();
  }
}
