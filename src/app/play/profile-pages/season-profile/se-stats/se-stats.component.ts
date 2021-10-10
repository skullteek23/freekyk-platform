import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
  @Input() stats: SeasonStats = {
    FKC_winner: 'NA',
    FPL_winner: 'NA',
    totParticipants: 0,
    totGoals: 0,
    awards: 'NA',
  };
  subscriptions = new Subscription();
  columns = '4';
  height = '0';
  gutter = '0';
  constructor(private mediaObs: MediaObserver) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.mediaObs
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
        })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
