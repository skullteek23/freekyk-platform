import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { GroundsFilters } from '@shared/Constants/FILTERS';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { FilterData } from '@shared/interfaces/others.model';
import { ArraySorting } from '@shared/utils/array-sorting';

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
    private ngFire: AngularFirestore,
    private queryServ: QueryService
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
            ({
              id: doc.id,
              ...(doc.data() as GroundBasicInfo),
            } as GroundBasicInfo)
          )
        ),
        map(resp => resp.sort(ArraySorting.sortObjectByKey('name')))
      );
  }
  onQueryData(queryInfo): void {
    if (queryInfo == null) {
      return this.getGrounds();
    }
    this.grounds$ = this.queryServ
      .onQueryData(queryInfo, 'grounds')
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as GroundBasicInfo)),
        map(resp => resp.sort(ArraySorting.sortObjectByKey('name')))
      );
  }
}
