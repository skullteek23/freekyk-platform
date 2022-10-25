import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { AppState } from 'src/app/store/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { FilterData, QueryInfo } from 'src/app/shared/interfaces/others.model';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  MatchFilters,
} from 'src/app/shared/Constants/FILTERS';
import { QueryService } from 'src/app/services/query.service';
import { DEFAULT_DASHBOARD_FIXTURES_LIMIT } from 'src/app/shared/Constants/DEFAULTS';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
@Component({
  selector: 'app-da-ho-all-fixtures',
  templateUrl: './da-ho-all-fixtures.component.html',
  styleUrls: ['./da-ho-all-fixtures.component.css'],
})
export class DaHoAllFixturesComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  isLoading = true;
  myFixtures$: Observable<MatchFixture[]>;
  allFixtures$: Observable<MatchFixture[]>;
  allResults$: Observable<MatchFixture[]>;
  filterData: FilterData;
  subscriptions = new Subscription();
  isListLoading: boolean;
  constructor(
    private ngFire: AngularFirestore,
    private store: Store<AppState>,
    private queryServ: QueryService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.filterData = {
      defaultFilterPath: 'allMatches',
      filtersObj: MatchFilters,
    };
    this.getPlayerFixtures();
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  onChangeIndex(changeState: MatTabChangeEvent): void {
    switch (changeState.index) {
      case 0:
        return this.getPlayerFixtures();
      case 1:
        return this.getAllFixtures();
      case 2:
        return this.getAllResults();
    }
  }
  onQueryMyFixtures(queryInfo: QueryInfo): void {
    this.isListLoading = true;
    if (queryInfo === null) {
      return this.getPlayerFixtures();
    }
    this.myFixtures$ = this.store.select('dash').pipe(
      map((resp) => (resp.hasTeam ? resp.hasTeam.name : null)),
      switchMap((teamName) => this.onQueryToFirebase(queryInfo, teamName)),
      tap(() => (this.isListLoading = false))
    );
  }
  onQueryAllFixtures(queryInfo: QueryInfo): void {
    this.isListLoading = true;
    if (queryInfo === null) {
      return this.getAllFixtures();
    }
    this.allFixtures$ = this.queryServ
      .onQueryMatchesForDashboard(queryInfo, 'allMatches', false)
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        tap(() => (this.isListLoading = false))
      );
  }
  onQueryResults(queryInfo: QueryInfo): void {
    this.isListLoading = true;
    if (queryInfo === null) {
      return this.getAllResults();
    }
    this.allResults$ = this.queryServ
      .onQueryMatchesForDashboard(queryInfo, 'allMatches', true)
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        tap(() => (this.isListLoading = false))
      );
  }
  getPlayerFixtures(): void {
    this.isListLoading = true;
    this.myFixtures$ = this.store.select('dash').pipe(
      map((resp) => (resp.hasTeam ? resp.hasTeam.name : null)),
      switchMap((teamName) => {
        return this.ngFire
          .collection('allMatches', (query) =>
            query
              .where('teams', 'array-contains', teamName)
              .where('concluded', '==', false)
              .limit(DEFAULT_DASHBOARD_FIXTURES_LIMIT)
          )
          .get()
          .pipe(
            tap((resp) => (this.tabGroup.selectedIndex = resp.empty ? 1 : 0)),
            map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
            map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
            tap(() => (this.isListLoading = false))
          );
      })
    );
  }
  getAllFixtures(): void {
    this.isListLoading = true;
    this.allFixtures$ = this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('concluded', '==', false)
          .limit(DEFAULT_DASHBOARD_FIXTURES_LIMIT)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
        tap(() => (this.isListLoading = false))
      );
  }
  getAllResults(): void {
    this.isListLoading = true;
    this.allResults$ = this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('concluded', '==', true)
          .limit(DEFAULT_DASHBOARD_FIXTURES_LIMIT)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
        tap(() => (this.isListLoading = false))
      );
  }
  onQueryToFirebase(queryInfo, teamName: string): Observable<MatchFixture[]> {
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };
    return this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('teams', 'array-contains', teamName)
          .where(
            queryInfo.queryItem,
            queryInfo.queryComparisonSymbol,
            queryInfo.queryValue
          )
          .limit(DEFAULT_DASHBOARD_FIXTURES_LIMIT)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
      );
  }
}
