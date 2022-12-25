import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-card-loading-shimmer',
  templateUrl: './card-loading-shimmer.component.html',
  styleUrls: ['./card-loading-shimmer.component.scss'],
})
export class CardLoadingShimmerComponent implements OnInit, OnDestroy {

  dummyArray = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  watcher: Subscription;
  columns: any;

  constructor(private mediaObs: MediaObserver) {
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

  ngOnInit(): void { }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
