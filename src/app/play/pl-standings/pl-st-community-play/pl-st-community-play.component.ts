import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CommunityLeaderboard } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-st-community-play',
  templateUrl: './pl-st-community-play.component.html',
  styleUrls: ['./pl-st-community-play.component.css'],
})
export class PlStCommunityPlayComponent implements OnInit, OnDestroy {
  cols: string[] = [];
  subscriptions = new Subscription();
  @Input('data') CommPlayDataSource: CommunityLeaderboard[] = [];
  constructor(private dialog: MatDialog, private mediaObs: MediaObserver) {
    this.subscriptions.add(
      mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.cols = ['home', 'away', 'winner'];
          } else {
            this.cols = ['home', 'away', 'stadium', 'winner'];
          }
        })
    );
  }
  ngOnInit(): void { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
