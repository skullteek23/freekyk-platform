import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS, DUMMY_FIXTURE_TABLE_COLUMNS, MatchConstantsSecondary } from '../../shared/constants/constants';

@Component({
  selector: 'app-fixture-table',
  templateUrl: './fixture-table.component.html',
  styleUrls: ['./fixture-table.component.css']
})
export class FixtureTableComponent implements OnInit {

  @Input() set data(value: any) {
    let dummyFixturesTemp = value;
    dummyFixturesTemp = dummyFixturesTemp.map(val => {
      return {
        [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: val.id,
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

  @Input() actions = false;

  readonly TABLE_UI_COLUMNS = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly TABLE_COLUMNS = DUMMY_FIXTURE_TABLE_COLUMNS;
  readonly TBD = MatchConstantsSecondary.TO_BE_DECIDED;

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

  getDate(date): Date {
    if (Object.keys(date).length < 2) {
      return new Date(date);
    } else {
      return date?.toDate();
    }
  }

}
