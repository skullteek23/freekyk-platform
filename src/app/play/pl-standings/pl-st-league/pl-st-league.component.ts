import { Component, Input, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
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
  subscriptions = new Subscription();
  cols: string[] = [];
  isNoData = false;
  @Input() set data(value: LeagueTableModel[]) {
    if (value) {
      this.setDataSource(value);
    }
  }
  constructor(private mediaObs: MediaObserver, private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      console.log(params);
    });
    this.subscriptions.add(
      this.mediaObs
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
        })
    );
  }

  setDataSource(value: LeagueTableModel[]) {
    const tableData = value
      .map((val) => {
        return {
          ...val,
          p: val.w + val.d + val.l,
          pts: 3 * val.w + val.d,
          gd: val.gf - val.ga,
        } as LeagueTableModel;
      })
      .sort((a, b) => b.pts - a.pts);
    this.LeagueDataSource = tableData;
  }
}
