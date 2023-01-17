import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { GroundsFilters } from '@shared/Constants/FILTERS';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { FilterData } from '@shared/interfaces/others.model';
import { manipulateGroundData } from '@shared/utils/pipe-functions';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-pl-grounds',
  templateUrl: './pl-grounds.component.html',
  styleUrls: ['./pl-grounds.component.scss'],
})
export class PlGroundsComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  columns: any;
  isLoading = true;
  noGrounds = false;
  grounds$: Observable<GroundBasicInfo[]>;
  filterData: FilterData;

  constructor(
    private mediaObs: MediaObserver,
    private queryService: QueryService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'grounds',
      filtersObj: GroundsFilters,
    };
    this.subscriptions.add(
      this.mediaObs
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
        })
    );
    this.getGrounds();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getGrounds(): void {
    this.grounds$ = this.apiService.getGrounds()
      .pipe(
        tap((val) => {
          this.noGrounds = val.length === 0;
          this.isLoading = false;
        }),
      );
  }

  onQueryData(queryInfo): void {
    if (queryInfo == null) {
      return this.getGrounds();
    }
    this.grounds$ = this.queryService
      .onQueryData(queryInfo, 'grounds')
      .pipe(manipulateGroundData.bind(this));
  }
}
