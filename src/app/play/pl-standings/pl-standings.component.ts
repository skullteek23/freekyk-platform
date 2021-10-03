import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { StandingsFilters } from 'src/app/shared/Constants/FILTERS';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
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
  knockoutFixtures: MatchFixture[] = [];
  seasonChosen = '';
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
  onChooseSeason(seasonName) {
    this.seasonChosen = seasonName.queryValue;
    this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('season', '==', seasonName.queryValue)
          .where('type', '==', 'FKC')
      )
      .get()
      .pipe(map((resp) => resp.docs.map((doc) => doc.data()) as MatchFixture[]))
      .subscribe((res) => {
        this.knockoutFixtures = res;
      });
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
