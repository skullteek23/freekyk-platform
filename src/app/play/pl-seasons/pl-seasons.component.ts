import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, share, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { SeasonsFilters } from '@shared/Constants/FILTERS';
import { FilterData } from '@shared/interfaces/others.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { PlayConstants } from '../play.constants';

@Component({
  selector: 'app-pl-seasons',
  templateUrl: './pl-seasons.component.html',
  styleUrls: ['./pl-seasons.component.css'],
})
export class PlSeasonsComponent implements OnInit, OnDestroy {
  readonly LIVE = PlayConstants.SEASON_STATUS_LIVE;
  readonly UPCOMING = PlayConstants.SEASON_STATUS_UPCOMING;
  isLoading = true;
  noSeasons = false;
  filterTerm: string = null;
  seasons$: Observable<SeasonBasicInfo[]>;
  filterData: FilterData;
  subscriptions = new Subscription();
  columns: number;
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private queryServ: QueryService
  ) { }
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'seasons',
      filtersObj: SeasonsFilters,
    };
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'xs') {
            this.columns = 1;
          } else if (change.mqAlias === 'sm') {
            this.columns = 2;
          } else if (change.mqAlias === 'md') {
            this.columns = 3;
          } else {
            this.columns = 4;
          }
        })
    );
    this.getSeasons();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getSeasons(): void {
    this.seasons$ = this.ngFire
      .collection('seasons')
      .valueChanges()
      .pipe(
        tap((val) => {
          this.noSeasons = val.length === 0;
          this.isLoading = false;
        }),
        map((resp) => resp.map((doc) => doc as SeasonBasicInfo)),
        share()
      );
  }
  onQueryData(queryInfo): void {
    this.isLoading = true;
    if (queryInfo === null) {
      return this.getSeasons();
    }
    this.seasons$ = this.queryServ.onQueryData(queryInfo, 'seasons').pipe(
      tap((resp) => {
        this.noSeasons = resp.empty;
        this.isLoading = false;
      }),
      map((resp) => resp.docs.map((doc) => doc.data() as SeasonBasicInfo))
    );
  }
}
