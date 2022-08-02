import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS, DUMMY_FIXTURE_TABLE_COLUMNS, MatchConstants } from '../../shared/constants/constants';
import { ArraySorting } from '../../shared/utils/array-sorting';

@Component({
  selector: 'app-fixture-table',
  templateUrl: './fixture-table.component.html',
  styleUrls: ['./fixture-table.component.css']
})
export class FixtureTableComponent implements OnInit {

  @Input() set data(value: any) {
    let dummyFixturesTemp = value;
    dummyFixturesTemp.sort(ArraySorting.sortObjectByKey('date'));
    dummyFixturesTemp = dummyFixturesTemp.map((val, index) => {
      const count = index + 1;
      return {
        [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: this.getMID(val.type, count),
        [DUMMY_FIXTURE_TABLE_COLUMNS.HOME]: this.TBD,
        [DUMMY_FIXTURE_TABLE_COLUMNS.AWAY]: this.TBD,
        [DUMMY_FIXTURE_TABLE_COLUMNS.DATE]: val.date,
        [DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION]: `${val.locCity}, ${val.locState}`,
        [DUMMY_FIXTURE_TABLE_COLUMNS.GROUND]: val.stadium,
        timestamp: new Date(val.date).getTime()
      }
    }, this);
    this.dataSource = new MatTableDataSource<any>(dummyFixturesTemp);
    this.tableLength = value.length;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      return data[sortHeaderId].toLowerCase();
    }
  }

  readonly TABLE_UI_COLUMNS = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly TABLE_COLUMNS = DUMMY_FIXTURE_TABLE_COLUMNS;
  readonly TBD = 'TBD';

  displayedColumns = [
    DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID,
    DUMMY_FIXTURE_TABLE_COLUMNS.HOME,
    DUMMY_FIXTURE_TABLE_COLUMNS.AWAY,
    DUMMY_FIXTURE_TABLE_COLUMNS.DATE,
    DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION,
    DUMMY_FIXTURE_TABLE_COLUMNS.GROUND,
  ]
  dataSource = new MatTableDataSource<any>([]);
  tableLength = 0;

  constructor() { }

  ngOnInit(): void {
  }

  getMID(type: 'FKC' | 'FPL' | 'FCP', index) {
    switch (type) {
      case 'FKC': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FKC}-${index}`;
      case 'FPL': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FPL}-${index}`;
      case 'FCP': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FCP}-${index}`;
    }
  }

}
