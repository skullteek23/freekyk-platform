import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from '@shared/Constants/FILTERS';
import { MatchFixture } from '@shared/interfaces/match.model';
import { FilterData } from '@shared/interfaces/others.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ActivatedRoute, Router } from '@angular/router';

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
    private ngFire: AngularFirestore,
    private queryServ: QueryService,
    private route: ActivatedRoute,
    private router: Router
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
  }

  onQueryFixtures(queryInfo): void {
    this.isLoading = true;
    this.fixtures$ = this.queryServ
      .onQueryMatches(queryInfo, 'allMatches', false)
      .pipe(
        tap((val) => {
          this.noFixtures = val.empty;
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        // map((res) => res.filter(el => el.date > new Date().getTime())),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
        tap(() => {
          this.isLoading = false;
        }),
      );
  }

  onQueryData(queryInfo): void {
    if (queryInfo) {
      const queryParamKey = queryInfo?.queryItem;
      this.router.navigate(['/play', 'fixtures'], { queryParams: { [queryParamKey]: queryInfo.queryValue } });
    } else {
      this.router.navigate(['/play', 'fixtures']);
    }
  }
}
