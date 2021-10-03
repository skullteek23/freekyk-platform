import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  SeasonsFilters,
} from 'src/app/shared/Constants/FILTERS';
import { FilterData, QueryInfo } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-pl-seasons',
  templateUrl: './pl-seasons.component.html',
  styleUrls: ['./pl-seasons.component.css'],
})
export class PlSeasonsComponent implements OnInit, OnDestroy {
  filterTerm: string = null;
  isLoading = true;
  noSeasons = false;
  seasons$: Observable<SeasonBasicInfo[]>;
  filterData: FilterData;
  watcher: Subscription;
  columns: any;
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private shareServ: SocialShareService,
    private title: Title,
    private meta: Meta
  ) {
    this.filterData = {
      defaultFilterPath: 'seasons',
      filtersObj: SeasonsFilters,
    };
    this.watcher = this.mediaObs
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
      });
  }
  ngOnInit(): void {
    this.getSeasons();
  }
  ngOnDestroy(): void {
    this.watcher.unsubscribe();
  }
  getSeasons(): void {
    this.seasons$ = this.ngFire
      .collection('seasons')
      .get()
      .pipe(
        tap((val) => {
          this.noSeasons = val.empty;
          this.isLoading = false;
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as SeasonBasicInfo))
      );
  }
  onShare(season: SeasonBasicInfo): void {
    // share logic here
  }
  onQueryData(queryInfo: QueryInfo): void {
    this.isLoading = true;
    if (queryInfo === null) {
      return this.getSeasons();
    }
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    this.seasons$ = this.ngFire
      .collection('seasons', (query) =>
        query.where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
      )
      .get()
      .pipe(
        tap((resp) => {
          console.log(resp);
          this.noSeasons = resp.empty;
          this.isLoading = false;
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as SeasonBasicInfo))
      );
  }
}
