import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatchFixture } from '@shared/interfaces/match.model';
import { AppState } from 'src/app/store/app.reducer';
import { Observable, Subscription } from 'rxjs';
import { FilterData, QueryInfo } from '@shared/interfaces/others.model';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  MatchFilters,
} from '@shared/Constants/FILTERS';
import { QueryService } from 'src/app/services/query.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants } from '@shared/constants/constants';
import { MatchCardComponent } from '@shared/dialogs/match-card/match-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
@Component({
  selector: 'app-da-ho-all-fixtures',
  templateUrl: './da-ho-all-fixtures.component.html',
  styleUrls: ['./da-ho-all-fixtures.component.scss'],
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
    private queryService: QueryService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private location: Location
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.subscriptions.add(
      this.route.queryParams.subscribe(qParams => {
        if (qParams && qParams.hasOwnProperty('open')) {
          this.onOpenFixture(qParams['open']);
        }
      })
    )
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
    this.allFixtures$ = this.queryService
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
    this.allResults$ = this.queryService
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
      switchMap((teamName) => this.ngFire
        .collection('allMatches', (query) =>
          query
            .where('teams', 'array-contains', teamName)
            .where('concluded', '==', false)
            .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
        )
        .get()
        .pipe(
          tap((resp) => (this.tabGroup.selectedIndex = resp.empty ? 1 : 0)),
          map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
          map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
          tap(() => (this.isListLoading = false))
        ))
    );
  }

  getAllFixtures(): void {
    this.isListLoading = true;
    this.allFixtures$ = this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('concluded', '==', false)
          .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
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
          .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
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
          .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)),
        map((resp) => resp.sort(ArraySorting.sortObjectByKey('date'))),
      );
  }

  onSelectFixture(fixture: MatchFixture) {
    if (fixture?.id) {
      this.router.navigate([this.router.url], { queryParams: { open: fixture.id } });
    }
  }

  onOpenFixture(fixtureID: string): void {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: fixtureID,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/dashboard/home'], { skipLocationChange: true });
      // this.location.go('/dashboard/home')
    });
  }
}
