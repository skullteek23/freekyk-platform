import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FilterHeadingMap, FilterSymbolMap, FilterValueMap, } from '@shared/Constants/FILTERS';
import { QueryInfo } from '@shared/interfaces/others.model';
import { MatchConstants } from '@shared/constants/constants';
import { ParseMatchProperties } from '@shared/interfaces/match.model';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  onQueryData(
    queryInfo: QueryInfo,
    collectionName: string
  ): Observable<QuerySnapshot<unknown>> {
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };
    if (
      collectionName &&
      queryInfo.queryItem &&
      queryInfo.queryComparisonSymbol &&
      queryInfo.queryValue
    ) {
      return this.ngFire
        .collection(collectionName, (query) =>
          query.where(
            queryInfo.queryItem,
            queryInfo.queryComparisonSymbol,
            queryInfo.queryValue
          )
        )
        .get();
    }
  }

  onQueryMatches(queryInfo: QueryInfo, collectionName: string, isResults: boolean): Observable<QuerySnapshot<unknown>> {
    let comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    const symbol = isResults ? '<=' : '>';
    if (!queryInfo) {
      return this.ngFire
        .collection(collectionName, (query) => query.where('date', symbol, comparator))
        .get();
    } else {
      queryInfo = {
        queryItem: FilterHeadingMap[queryInfo.queryItem],
        queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
          ? FilterSymbolMap[queryInfo.queryItem]
          : '==',
        queryValue: FilterValueMap[queryInfo.queryValue] || queryInfo.queryValue,
      };
      return this.ngFire
        .collection(collectionName, (query) =>
          query
            .where(
              queryInfo.queryItem,
              queryInfo.queryComparisonSymbol,
              queryInfo.queryValue
            )
            .where('date', symbol, comparator)
        )
        .get();
    }
  }

  onQueryMatchesForDashboard(
    queryInfo: QueryInfo,
    collectionName: string,
    isConcluded: boolean
  ): Observable<QuerySnapshot<unknown>> {
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    return this.ngFire
      .collection(collectionName, (query) =>
        query
          .where(
            queryInfo.queryItem,
            queryInfo.queryComparisonSymbol,
            queryInfo.queryValue
          )
          .where('concluded', '==', isConcluded)
          .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
      )
      .get();
  }
  constructor(private ngFire: AngularFirestore) { }
}
