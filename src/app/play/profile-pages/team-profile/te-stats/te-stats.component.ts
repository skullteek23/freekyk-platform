import { Component, Input, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StatsTeam } from 'src/app/shared/interfaces/others.model';
import { TeamStats } from 'src/app/shared/interfaces/team.model';

@Component({
  selector: 'app-te-stats',
  templateUrl: './te-stats.component.html',
  styleUrls: ['./te-stats.component.css'],
})
export class TeStatsComponent implements OnInit {
  @Input() data: StatsTeam;
  watcher: Subscription;
  columns: any;
  height: string = '0';
  stats: string[] = [
    'Matches Played (FKC)',
    'Matches Played (FCP)',
    'Matches Played (FPL)',
    'Wins',
    'Goals',
    'Losses',
    'Red Cards',
    'Yellow Cards',
    'Goals Conceded',
    'Clean Sheets',
  ];
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
          this.columns = 1;
          this.height = '24px';
          this.gutter = '0px';
        } else {
          this.columns = 5;
          this.height = '150px';
          this.gutter = '20px';
        }
      });
  }
  ngOnInit() {}
}
