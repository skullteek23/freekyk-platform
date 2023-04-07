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
import { ApiGetService } from '@shared/services/api.service';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';

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
  seasons: SeasonBasicInfo[] = [];
  filterData: FilterData;
  subscriptions = new Subscription();
  columns: number;

  constructor(
    private apiService: ApiGetService,
    private queryService: QueryService,
    private socialShareService: SocialShareService,
    private router: Router,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getSeasons();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSeasons(): void {
    this.apiService.getSeasons().subscribe({
      next: (response) => {
        if (response) {
          // this.seasons = response;
          window.scrollTo(0, 0);
        }
      },
      error: () => {
        this.seasons = [];
        this.snackBarService.displayError('Error getting seasons!')
        window.scrollTo(0, 0);
      }
    });
  }

  onShareSeason(season: SeasonBasicInfo) {
    const data = new ShareData();
    data.share_url = `/s/${season.name}`;
    data.share_title = season.name;
    this.socialShareService.onShare(data);
  }

  openSeason(season: SeasonBasicInfo) {
    this.router.navigate(['/s', season.id]);
  }
}
