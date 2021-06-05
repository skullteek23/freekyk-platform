import { Component, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LeagueTableModel } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-st-league',
  templateUrl: './pl-st-league.component.html',
  styleUrls: ['./pl-st-league.component.css'],
})
export class PlStLeagueComponent implements OnInit {
  timgpath =
    'https://images.unsplash.com/photo-1599446740719-23f3414840ba?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=742&q=80';
  LeagueDataSource: LeagueTableModel[] = [];
  watcher: Subscription;
  cols: string[] = [];
  constructor(private mediaObs: MediaObserver) {
    // this.initLeagueData();
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.cols = [
            'pos',
            'Team',
            'W',
            'D',
            'L',
            'Pts',
            'P',
            'GF',
            'GA',
            'GD',
          ];
        } else {
          this.cols = [
            'pos',
            'Team',
            'P',
            'W',
            'D',
            'L',
            'GF',
            'GA',
            'GD',
            'Pts',
          ];
        }
      });
  }
  ngOnInit() {}
}
