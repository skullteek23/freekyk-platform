import { Component, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { dummyFixture } from 'src/app/shared/interfaces/match.model';
import { DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS, DUMMY_FIXTURE_TABLE_COLUMNS, MatchConstantsSecondary } from '../../shared/constants/constants';

@Component({
  selector: 'app-fixture-table',
  templateUrl: './fixture-table.component.html',
  styleUrls: ['./fixture-table.component.css']
})
export class FixtureTableComponent implements OnInit {

  @Input() set data(value: dummyFixture[]) {
    const currentDate = new Date().getTime();
    const dummyFixturesTemp = value.map(val => {
      return {
        [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: val.id,
        [DUMMY_FIXTURE_TABLE_COLUMNS.HOME]: this.TBD,
        [DUMMY_FIXTURE_TABLE_COLUMNS.AWAY]: this.TBD,
        [DUMMY_FIXTURE_TABLE_COLUMNS.DATE]: val.date,
        [DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION]: `${val.locCity}, ${val.locState}`,
        [DUMMY_FIXTURE_TABLE_COLUMNS.GROUND]: val.stadium,
        occurred: currentDate > val.date,
      }
    }, this);
    this.dataSource = new MatTableDataSource<any>(dummyFixturesTemp);
    this.tableLength = value.length;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      return data[sortHeaderId].toLowerCase();
    }
  }

  @Input() set actions(value: boolean) {
    this.setDisplayColumns(value);
  }

  @Output() actionTrigger = new Subject<any>();

  readonly TABLE_UI_COLUMNS = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly TABLE_COLUMNS = DUMMY_FIXTURE_TABLE_COLUMNS;
  readonly TBD = MatchConstantsSecondary.TO_BE_DECIDED;

  displayedColumns = [];
  dataSource = new MatTableDataSource<any>([]);
  tableLength = 0;

  constructor() {
    this.setDisplayColumns(false);
  }

  ngOnInit(): void { }

  setDisplayColumns(onIncludeActionCol = false) {
    if (onIncludeActionCol) {
      this.displayedColumns = [
        DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID,
        DUMMY_FIXTURE_TABLE_COLUMNS.HOME,
        DUMMY_FIXTURE_TABLE_COLUMNS.AWAY,
        DUMMY_FIXTURE_TABLE_COLUMNS.DATE,
        DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION,
        DUMMY_FIXTURE_TABLE_COLUMNS.GROUND,
        'actions'
      ]
    } else {
      this.displayedColumns = [
        DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID,
        DUMMY_FIXTURE_TABLE_COLUMNS.HOME,
        DUMMY_FIXTURE_TABLE_COLUMNS.AWAY,
        DUMMY_FIXTURE_TABLE_COLUMNS.DATE,
        DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION,
        DUMMY_FIXTURE_TABLE_COLUMNS.GROUND,
      ];
    }
  }

  onTriggerAction(data: any) {
    if (data.occurred) {
      this.actionTrigger.next(data[this.TABLE_COLUMNS.MATCH_ID]);
    }
  }

}
