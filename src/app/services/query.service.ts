import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FilterHeadingMap, FilterSymbolMap, FilterValueMap, } from '@shared/Constants/FILTERS';
import { QueryInfo } from '@shared/interfaces/others.model';

@Injectable({
  providedIn: 'root',
})
export class QueryService {

  constructor(
    private ngFire: AngularFirestore,
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
}
