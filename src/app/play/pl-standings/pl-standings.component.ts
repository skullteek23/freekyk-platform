import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StandingsFilters } from 'src/app/shared/Constants/FILTERS';
import { FilterData } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-pl-standings',
  templateUrl: './pl-standings.component.html',
  styleUrls: ['./pl-standings.component.css'],
})
export class PlStandingsComponent implements OnInit, OnDestroy {
  onMobile: boolean = false;
  watcher: Subscription;
  filterData: FilterData = {
    defaultFilterPath: '',
    filtersObj: {},
  };
  constructor(
    private dialog: MatDialog,
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore
  ) {}
  ngOnInit(): void {
    this.ngFire
      .collection('seasons')
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map((doc) => (doc.data() as SeasonBasicInfo).name)
        )
      )
      .subscribe((resp) => {
        this.filterData = {
          defaultFilterPath: 'standings',
          filtersObj: {
            Season: resp,
          },
        };
      });
  }
  ngOnDestroy() {
    if (this.watcher) this.watcher.unsubscribe();
  }
  onChooseSeason(season: string) {
    this.ngFire
      .collection('allMatches', (query) =>
        query.where('season', '==', season).where('type', '==', 'FKC')
      )
      .get();
  }
  onChangeTab(event: MatTabChangeEvent) {
    if (event.index == 1)
      this.watcher = this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.onMobile = true;
          } else {
            this.onMobile = false;
          }
        });
  }
}
