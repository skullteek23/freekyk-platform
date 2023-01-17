import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FilterHeadingMap, FilterSymbolMap, FilterValueMap, } from '@shared/Constants/FILTERS';
import { QueryInfo } from '@shared/interfaces/others.model';
import { MatchConstants } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class QueryService {

  constructor(
    private ngFire: AngularFirestore,
    private apiService: ApiService
  ) { }

  onQueryData(queryInfo: QueryInfo, collectionName: string): Observable<QuerySnapshot<unknown>> {
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };
    if (collectionName && queryInfo.queryItem && queryInfo.queryComparisonSymbol && queryInfo.queryValue) {
      return this.ngFire.collection(collectionName, (query) =>
        query.where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
      ).get();
    }
  }

  onQueryMatches(queryInfo: QueryInfo, collectionName: string, isConcluded: boolean): Observable<QuerySnapshot<unknown>> {
    if (!queryInfo) {
      return this.apiService.getMatches(isConcluded);
    }
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue] || queryInfo.queryValue,
    };
    return this.ngFire.collection(collectionName,
      (query) => query
        .where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
        .where('concluded', '==', isConcluded)
    ).get();
  }

  onQueryMatchesForDashboard(queryInfo: QueryInfo, collectionName: string, isConcluded: boolean): Observable<QuerySnapshot<unknown>> {
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    return this.ngFire.collection(collectionName, (query) =>
      query
        .where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
        .where('concluded', '==', isConcluded)
        .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
    ).get();
  }
}
