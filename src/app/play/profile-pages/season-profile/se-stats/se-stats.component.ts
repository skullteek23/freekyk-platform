import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SeasonStats } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-se-stats',
  templateUrl: './se-stats.component.html',
  styleUrls: ['./se-stats.component.css'],
})
export class SeStatsComponent implements OnInit, OnDestroy {
  @Input('stats') data: SeasonStats = {
    FKC_winner: 'NA',
    FPL_winner: 'NA',
    totParticipants: 0,
    totGoals: 0,
    awards: 'NA',
  };
  watcher: Subscription;
  columns: string = '4';
  height: string = '0';
  gutter: string = '0';
  constructor(private mediaObs: MediaObserver) {
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.columns = '1';
          this.height = '24px';
          this.gutter = '0px';
        } else {
          this.columns = '4';
          this.height = '150px';
          this.gutter = '20px';
        }
      });
  }
  ngOnInit() {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
