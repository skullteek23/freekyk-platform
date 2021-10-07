import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'admin';
  cols: number;
  watcher: Subscription;
  constructor(private mediaObs: MediaObserver) {
    this.watcher = this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.cols = 1;
        } else if (change.mqAlias === 'sm') {
          this.cols = 2;
        } else {
          this.cols = 3;
        }
      });
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.watcher.unsubscribe();
  }
}
