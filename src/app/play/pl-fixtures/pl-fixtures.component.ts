import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { MatchFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.css'],
})
export class PlFixturesComponent implements OnInit, OnDestroy {
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
    this.initSeasonFilter();
    this.subscriptions.add(
      this.route.queryParams.subscribe((params) => {
        if (params && params.s) {
          const filter = {
            queryItem: 'Season',
            queryValue: params.s
          }
          this.onQueryFixtures(filter);
        } else {
          this.onQueryFixtures(null);
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
      )
  }

  onQueryData(queryInfo): void {
    if (queryInfo) {
      this.router.navigate(['/play', 'fixtures'], { queryParams: { s: queryInfo.queryValue } });
    } else {
      this.router.navigate(['/play', 'fixtures']);
    }
  }
}
