import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LeagueTableModel } from '@shared/interfaces/others.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { PlayConstants } from '../../play.constants';

@Component({
  selector: 'app-pl-st-league',
  templateUrl: './pl-st-league.component.html',
  styleUrls: ['./pl-st-league.component.scss'],
})
export class PlStLeagueComponent implements OnInit, OnDestroy {

  readonly TO_BE_DECIDED = PlayConstants.TO_BE_DECIDED;

  cols: string[] = [];
  isNoData = false;
  LeagueDataSource: LeagueTableModel[] = [];
  subscriptions = new Subscription();

  @Input() set data(value: LeagueTableModel[]) {
    if (value) {
      value.sort(ArraySorting.getSortedLeague);
      this.setDataSource(value);
    }
  }

  constructor(private mediaObs: MediaObserver) { }

  ngOnInit() {
    this.subscriptions.add(this.mediaObs.asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.cols = ['pos', 'Team', 'W', 'D', 'L', 'Pts', 'P', 'GF', 'GA', 'GD',];
        } else {
          this.cols = ['pos', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];
        }
      }));
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  setDataSource(value: LeagueTableModel[]) {
    const tableData = value
      .map((val) => ({
        ...val,
        p: val.w + val.d + val.l,
        pts: 3 * val.w + val.d,
        gd: val.gf - val.ga,
      } as LeagueTableModel))
      .sort((a, b) => b.pts - a.pts);
    this.LeagueDataSource = tableData;
  }
}
