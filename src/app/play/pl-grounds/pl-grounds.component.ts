import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import {
  FilterHeadingMap,
  FilterSymbolMap,
  FilterValueMap,
  GroundsFilters,
} from 'src/app/shared/Constants/FILTERS';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/LOREM_IPSUM';
import { GroundBasicInfo } from 'src/app/shared/interfaces/ground.model';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FilterData, ShareData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-grounds',
  templateUrl: './pl-grounds.component.html',
  styleUrls: ['./pl-grounds.component.css'],
})
export class PlGroundsComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  columns: any;
  cardHeight: string = '';
  isLoading = true;
  noGrounds = false;
  grounds$: Observable<GroundBasicInfo[]>;
  filterData: FilterData;
  constructor(
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore,
    private shareServ: SocialShareService
  ) {
    this.filterData = {
      defaultFilterPath: 'grounds',
      filtersObj: GroundsFilters,
    };
    this.watcher = this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.columns = 1;
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
        } else if (change.mqAlias === 'md') {
          this.columns = 3;
        } else {
          this.columns = 4;
        }
      });
  }

  ngOnInit(): void {
    this.getGrounds();
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getGrounds() {
    this.grounds$ = this.ngFire
      .collection('grounds')
      .get()
      .pipe(
        tap((val) => {
          this.noGrounds = val.empty;
          this.isLoading = false;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <GroundBasicInfo>{ id: doc.id, ...(<GroundBasicInfo>doc.data()) }
          )
        )
      );
  }
  onQueryData(queryInfo) {
    if (queryInfo == null) {
      this.getGrounds();
    }
    queryInfo = {
      queryItem: FilterHeadingMap[queryInfo.queryItem],
      queryComparisonSymbol: FilterSymbolMap[queryInfo.queryItem]
        ? FilterSymbolMap[queryInfo.queryItem]
        : '==',
      queryValue: FilterValueMap[queryInfo.queryValue],
    };

    this.grounds$ = this.ngFire
      .collection('grounds', (query) =>
        query.where(
          queryInfo.queryItem,
          queryInfo.queryComparisonSymbol,
          queryInfo.queryValue
        )
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as GroundBasicInfo))
      );
  }
}
