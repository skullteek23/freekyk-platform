import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  MatchFilters,
} from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-fixtures',
  templateUrl: './pl-fixtures.component.html',
  styleUrls: ['./pl-fixtures.component.css'],
})
export class PlFixturesComponent implements OnInit {
  isLoading: boolean = true;
  noFixtures: boolean = false;
  fixtures$: Observable<MatchFixture[]>;
  filterData: FilterData;
  constructor(private ngFire: AngularFirestore) {}
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'allMatches',
      filtersObj: MatchFilters,
    };
    this.getFixtures();
  }
  getFixtures() {
    this.fixtures$ = this.ngFire
      .collection('allMatches', (query) =>
        query.where('concluded', '==', false)
      )
      .get()
      .pipe(
        tap((val) => {
          this.noFixtures = val.empty;
          this.isLoading = false;
        }),
        map((resp) => <MatchFixture[]>resp.docs.map((doc) => doc.data()))
      );
  }
  onQueryData(queryInfo) {
    if (queryInfo === null) {
      return this.getFixtures();
    }
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    this.fixtures$ = this.ngFire
      .collection('allMatches', (query) =>
        query.where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
      )
      .get()
      .pipe(map((resp) => resp.docs.map((doc) => doc.data() as MatchFixture)));
  }
}
