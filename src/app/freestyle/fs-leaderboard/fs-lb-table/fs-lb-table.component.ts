import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { fsLeaderboardModel } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-fs-lb-table',
  templateUrl: './fs-lb-table.component.html',
  styleUrls: ['./fs-lb-table.component.css'],
})
export class FsLbTableComponent implements OnInit, OnDestroy {
  @Input('data') fsLeaderboardDataSource: fsLeaderboardModel[] = [];
  watcher: Subscription;
  columns: number = 4;
  cols: string[] = [];
  constructor(private mediaObs: MediaObserver) {
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.cols = ['rank', 'freestyler', 'pts'];
        } else if (change.mqAlias === 'md') {
          this.cols = ['rank', 'freestyler', 'country', 'pts'];
        } else {
          this.cols = ['rank', 'freestyler', 'nickname', 'country', 'pts'];
        }
      });
  }

  ngOnInit(): void {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
