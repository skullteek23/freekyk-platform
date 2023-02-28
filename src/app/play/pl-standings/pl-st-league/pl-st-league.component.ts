import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LeagueTableModel } from '@shared/interfaces/others.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { PlayConstants } from '../../play.constants';

@Component({
  selector: 'app-pl-st-league',
  templateUrl: './pl-st-league.component.html',
  styleUrls: ['./pl-st-league.component.scss'],
})
export class PlStLeagueComponent {

  readonly TO_BE_DECIDED = PlayConstants.TO_BE_DECIDED;

  cols: string[] = ['position', 'team', 'played', 'won', 'draw', 'lost', 'points', 'goalsFor', 'goalsAgainst', 'goalDiff'];
  dataSource: LeagueTableModel[] = [];

  @Input() set data(value: LeagueTableModel[]) {
    if (value) {
      value.sort(ArraySorting.getSortedLeague);
      this.setDataSource(value);
    }
  }

  constructor() { }

  setDataSource(value: LeagueTableModel[]) {
    const tableData = value
      .map((val) => ({
        ...val,
        p: val.w + val.d + val.l,
        pts: 3 * val.w + val.d,
        gd: val.gf - val.ga,
      } as LeagueTableModel))
      .sort((a, b) => b.pts - a.pts);
    this.dataSource = tableData;
  }
}
