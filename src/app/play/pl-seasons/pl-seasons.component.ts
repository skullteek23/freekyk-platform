import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { SeasonsFilters } from '@shared/Constants/FILTERS';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { PlayConstants } from '../play.constants';
import { SocialShareService } from '@app/services/social-share.service';
import { FilterData } from '@shared/interfaces/others.model';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { ApiService } from '@shared/services/api.service';
import { manipulateSeasonData } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-pl-seasons',
  templateUrl: './pl-seasons.component.html',
  styleUrls: ['./pl-seasons.component.scss'],
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
    private apiService: ApiService,
    private mediaObs: MediaObserver,
    private queryService: QueryService,
    private socialShareService: SocialShareService
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
    this.seasons$ = this.apiService.getSeasons().pipe(
      tap((val: SeasonBasicInfo[]) => {
        this.noSeasons = val.length === 0;
        this.isLoading = false;
      }),
    );
  }

  onQueryData(queryInfo): void {
    this.isLoading = true;
    if (queryInfo === null) {
      return this.getSeasons();
    }
    this.seasons$ = this.queryService.onQueryData(queryInfo, 'seasons').pipe(
      manipulateSeasonData.bind(this),
      tap((val: SeasonBasicInfo[]) => {
        this.noSeasons = val.length === 0;
        this.isLoading = false;
      }),
    );
  }

  onShareSeason(element: SeasonBasicInfo) {
    const data = new ShareData();
    data.share_url = `/s/${element.name}`;
    data.share_title = element.name;
    this.socialShareService.onShare(data);
  }
}
