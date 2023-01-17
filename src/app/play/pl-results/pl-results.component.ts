import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from '@shared/Constants/FILTERS';
import { MatchFixture } from '@shared/interfaces/match.model';
import { FilterData } from '@shared/interfaces/others.model';
import { manipulateResultData } from '@shared/utils/pipe-functions';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-pl-results',
  templateUrl: './pl-results.component.html',
  styleUrls: ['./pl-results.component.scss'],
})
export class PlResultsComponent implements OnInit, OnDestroy {

  isLoading = true;
  noResults = false;
  results$: Observable<MatchFixture[]>;
  filterData: FilterData;
  subscriptions = new Subscription();

  constructor(
    private queryService: QueryService,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.initSeasonFilter();
    this.subscriptions.add(
      this.route.queryParams.subscribe((params) => {
        if (params && Object.keys(params).length) {
          const filter = {
            queryItem: Object.keys(params)[0],
            queryValue: Object.values(params)[0]
          };
          this.onQueryResults(filter);
        } else {
          this.onQueryResults(null);
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initSeasonFilter() {
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

  onQueryResults(queryInfo): void {
    this.isLoading = true;
    this.results$ = this.queryService
      .onQueryMatches(queryInfo, 'allMatches', true)
      .pipe(
        tap((val) => {
          this.noResults = val.empty;
          this.isLoading = false;
        }),
        manipulateResultData.bind(this)
      );
  }

  onQueryData(queryInfo): void {
    let queryParams = null;
    if (queryInfo) {
      const queryParamKey = queryInfo?.queryItem;
      queryParams = { queryParams: { [queryParamKey]: queryInfo.queryValue } };
    }
    this.router.navigate(['/play', 'results'], queryParams);
  }
}
