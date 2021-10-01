import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StandingsFilters } from 'src/app/shared/Constants/FILTERS';
import { FilterData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-standings',
  templateUrl: './pl-standings.component.html',
  styleUrls: ['./pl-standings.component.css'],
})
export class PlStandingsComponent implements OnInit, OnDestroy {
  onMobile: boolean = false;
  watcher: Subscription;
  filterData: FilterData;
  constructor(private dialog: MatDialog, private mediaObs: MediaObserver) {}
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'standings',
      filtersObj: StandingsFilters,
    };
  }
  ngOnDestroy() {
    if (this.watcher) this.watcher.unsubscribe();
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
