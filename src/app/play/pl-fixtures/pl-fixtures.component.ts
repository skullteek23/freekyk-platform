import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from '@shared/Constants/FILTERS';
import { MatchFixture } from '@shared/interfaces/match.model';
import { FilterData } from '@shared/interfaces/others.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { manipulateFixtureData } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.scss'],
})
export class PlFixturesComponent implements OnInit, OnDestroy {

  @Input() season: string = '';

  isLoading = true;
  noFixtures = false;
  fixtures$: Observable<MatchFixture[]>;
  filterData: FilterData;
  subscriptions = new Subscription();

  constructor(
    private queryService: QueryService,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    if (!this.season) {
      this.initSeasonFilter();
      this.subscriptions.add(
        this.route.queryParams.subscribe((params) => {
          if (params && Object.keys(params).length) {
            const filter = {
              queryItem: Object.keys(params)[0],
              queryValue: Object.values(params)[0]
            };
            this.onQueryFixtures(filter);
          } else {
            this.onQueryFixtures(null);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initSeasonFilter() {
    if (this.season) {
      this.filterData = {
        defaultFilterPath: 'allMatches',
        filtersObj: {
          ...MatchFilters,
          Season: [this.season],
        },
      };
    } else {
      this.apiService.getSeasons()
        .subscribe((resp) => {
          this.filterData = {
            defaultFilterPath: 'allMatches',
            filtersObj: {
              ...MatchFilters,
              Season: resp.map(res => res.name),
            },
          };
        });

    }
  }

  onQueryFixtures(queryInfo): void {
    this.isLoading = true;
    this.fixtures$ = this.queryService
      .onQueryMatches(queryInfo, 'allMatches', false)
      .pipe(
        tap((val) => {
          this.noFixtures = val.empty;
          this.isLoading = false;
        }),
        manipulateFixtureData.bind(this)
      );
  }

  onQueryData(queryInfo): void {
    let queryParams = null;
    if (queryInfo) {
      const queryParamKey = queryInfo?.queryItem;
      queryParams = { queryParams: { [queryParamKey]: queryInfo.queryValue } };
    }
    this.router.navigate(['/play', 'fixtures'], queryParams);
  }
}
