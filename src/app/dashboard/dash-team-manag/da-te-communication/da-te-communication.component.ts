import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';
import { TeamCommunicationService } from 'src/app/services/team-communication.service';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import {
  ActiveSquadMember,
  MemberResponseNotification,
} from 'src/app/shared/interfaces/team.model';
import { TeamState } from '../store/team.reducer';
@Component({
  selector: 'app-da-te-communication',
  templateUrl: './da-te-communication.component.html',
  styleUrls: ['./da-te-communication.component.css'],
})
export class DaTeCommunicationComponent implements OnInit, OnDestroy {
  noMatch = 0;
  currMatch = 0;
  upmMatches: MatchFixture[] = [];
  activeTeamActivity: MemberResponseNotification[] = [];
  currSelectedMatch$: Observable<MatchFixture>;
  activeSquad$: Observable<ActiveSquadMember[]>;
  activeMatch$: Observable<MatchFixture>;
  storeSub$: Observable<MatchFixture[]>;
  captainStatus$: Observable<boolean>;
  subscriptions = new Subscription();
  constructor(
    private store: Store<{ team: TeamState }>,
    private commServ: TeamCommunicationService,
    private ngFire: AngularFirestore
  ) {}
  ngOnInit(): void {
    this.storeSub$ = this.store.select('team').pipe(
      tap(() => {
        const tid = sessionStorage.getItem('tid');
        this.activeSquad$ = this.ngFire
          .collection('teamCommunications')
          .doc(tid)
          .collection('activeSquad1')
          .valueChanges()
          .pipe(
            map((resp) =>
              resp != null || resp !== undefined
                ? (resp as ActiveSquadMember[])
                : []
            )
          );
      }),
      tap((resp) => (this.noMatch = resp.upcomingMatches.length)),
      map((resp) => resp.upcomingMatches.slice(0, 3)),
      tap((resp) => (this.currSelectedMatch$ = of(resp[0])))
    );

    this.captainStatus$ = this.store.select('team').pipe(
      map((resp) => resp.basicInfo.captainId === localStorage.getItem('uid')),
      take(1)
    );

    this.subscriptions.add(
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
        .subscribe()
    );
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  getSquad(sqNumber: number): void {
    this.commServ.getActiveSquad(sqNumber);
  }
  onChangeTab(newTabNumber: MatTabChangeEvent): void {
    this.subscriptions.add(
      this.storeSub$
        .pipe(
          map(
            (resp) => (this.currSelectedMatch$ = of(resp[newTabNumber.index]))
          ),
          tap((resp) => {
            this.commServ.setSelectedMatch(newTabNumber.index);
            this.commServ.getActiveSquad(newTabNumber.index);
          })
        )
        .subscribe()
    );
  }
}
