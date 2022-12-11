import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, share, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { TeamsFilters } from '@shared/Constants/FILTERS';
import { FilterData } from '@shared/interfaces/others.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { ArraySorting } from '@shared/utils/array-sorting';

@Component({
  selector: 'app-pl-teams',
  templateUrl: './pl-teams.component.html',
  styleUrls: ['./pl-teams.component.scss'],
})
export class PlTeamsComponent implements OnInit, OnDestroy {
  filterTerm: string = null;
  isLoading = true;
  noTeams = false;
  onMobile = false;
  teams$: Observable<TeamBasicInfo[]>;
  filterData: FilterData;
  cols = 1;
  subscriptions = new Subscription();
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private queryServ: QueryService
  ) { }

  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'teams',
      filtersObj: TeamsFilters,
    };
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.onMobile = true;
          } else if (change.mqAlias === 'md') {
            this.onMobile = false;
            this.cols = 3;
          } else {
            this.onMobile = false;
            this.cols = 4;
          }
        })
    );
    this.getTeams();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getTeams(): void {
    this.teams$ = this.ngFire
      .collection('teams', (ref) => ref.orderBy('tname'))
      .get()
      .pipe(
        tap((val) => {
          this.noTeams = val.empty;
          this.isLoading = false;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
            ({
              id: doc.id,
              ...(doc.data() as TeamBasicInfo),
            } as TeamBasicInfo)
          )
        ),
        map(resp => resp.sort(ArraySorting.sortObjectByKey('tname'))),
        share()
      );
  }
  onQueryData(queryInfo): void {
    if (queryInfo === null) {
      return this.getTeams();
    }
    this.teams$ = this.queryServ
      .onQueryData(queryInfo, 'teams')
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as TeamBasicInfo)),
        map(resp => resp.sort(ArraySorting.sortObjectByKey('tname'))),
      );
  }
}
