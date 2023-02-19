import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MemberResponseNotification } from '@shared/interfaces/team.model';
// import { TeamCommState } from '../da-te-communication/store/teamComm.reducer';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-team-activity',
  templateUrl: './team-activity.component.html',
  styleUrls: ['./team-activity.component.scss'],
})
export class TeamActivityComponent implements OnInit, OnDestroy {

  readonly CUSTOM_DATE_FORMAT = MatchConstants.TEAM_ACTIVITY_DATE_FORMAT;

  teamActivityListLogs$: Observable<MemberResponseNotification[]>;
  noLogs = false;
  subscriptions = new Subscription();

  constructor(
    // private store: Store<{ teamComms: TeamCommState }>,
    private ngFireDb: AngularFireDatabase
  ) { }

  ngOnInit(): void {
    // this.subscriptions.add(
    //   this.store
    //     .select('teamComms')
    //     .pipe(
    //       tap(
    //         (resp) =>
    //         (this.noLogs =
    //           resp.currUpcomingMatchNo < 0 && resp.currUpcomingMatchNo > 2)
    //       ),
    //       map((resp) => resp.currUpcomingMatchNo)
    //     )
    //     .subscribe((matchNo) => {
    //       const tid = sessionStorage.getItem('tid');
    //       this.teamActivityListLogs$ = this.ngFireDb
    //         .list(`teamActivity/${tid}/activity${matchNo.toString()}`)
    //         .valueChanges()
    //         .pipe(
    //           // tap((resp) => console.log(resp)),
    //           map((resp: any[]) => resp.sort(ArraySorting.sortObjectByKey('time', 'desc'))),
    //           map((resp: MemberResponseNotification[]) =>
    //             resp.map(
    //               (r) =>
    //               ({
    //                 content: r.content,
    //                 time: new Date(r.time),
    //               } as MemberResponseNotification)
    //             )
    //           )
    //         );
    //     })
    // );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
