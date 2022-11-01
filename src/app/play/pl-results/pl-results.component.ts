import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';

@Component({
  selector: 'app-pl-results',
  templateUrl: './pl-results.component.html',
  styleUrls: ['./pl-results.component.css'],
})
export class PlResultsComponent implements OnInit, OnDestroy {
  isLoading = true;
  noResults = false;
  results$: Observable<MatchFixture[]>;
  filterData: FilterData;
  subscriptions = new Subscription();
  constructor(
    private ngFire: AngularFirestore,
    private queryServ: QueryService,
    private route: ActivatedRoute,
    private router: Router,
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
    this.ngFire
      .collection('seasons')
      .get()
      .pipe(map((resp) => resp.docs.map((doc) => (doc.data() as SeasonBasicInfo).name)))
      .subscribe((resp) => {
        this.filterData = {
          defaultFilterPath: 'allMatches',
          filtersObj: {
            ...MatchFilters,
            Season: resp,
          },
        };
      });
  }

  onQueryResults(queryInfo): void {
    this.isLoading = true;
    this.results$ = this.queryServ
      .onQueryMatches(queryInfo, 'allMatches', true)
      .pipe(
        tap((val) => {
          this.noResults = val.empty;
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date', 'desc'))),
        tap(() => {
          this.isLoading = false;
        }),
      );
  }

  onQueryData(queryInfo): void {
    if (queryInfo) {
      const queryParamKey = queryInfo?.queryItem;
      this.router.navigate(['/play', 'results'], { queryParams: { [queryParamKey]: queryInfo.queryValue } });
    } else {
      this.router.navigate(['/play', 'results']);
    }
  }
}
