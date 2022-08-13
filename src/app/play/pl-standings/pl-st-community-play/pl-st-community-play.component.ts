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
  timgpath =
    'https://images.unsplash.com/photo-1599446740719-23f3414840ba?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=742&q=80';
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
