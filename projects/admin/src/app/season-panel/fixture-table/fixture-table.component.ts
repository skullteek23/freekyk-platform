import { Component, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { dummyFixture } from 'src/app/shared/interfaces/match.model';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS, DUMMY_FIXTURE_TABLE_COLUMNS, MatchConstantsSecondary } from '../../shared/constants/constants';

@Component({
  selector: 'app-fixture-table',
  templateUrl: './fixture-table.component.html',
  styleUrls: ['./fixture-table.component.css']
})
export class FixtureTableComponent {

  @Input() set data(value: dummyFixture[]) {
    const currentDate = new Date().getTime();
    const dummyFixturesTemp = value.map(val => {
      return {
        [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: val.id,
        [DUMMY_FIXTURE_TABLE_COLUMNS.HOME]: val.home,
        [DUMMY_FIXTURE_TABLE_COLUMNS.AWAY]: val.away,
        [DUMMY_FIXTURE_TABLE_COLUMNS.DATE]: val.date,
        [DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION]: `${val.locCity}, ${val.locState}`,
        [DUMMY_FIXTURE_TABLE_COLUMNS.GROUND]: val.stadium,
        occurred: currentDate > val.date,
        concluded: val.concluded,
        action: val.concluded ? 'Submitted' : 'Update Match'
      }
    }, this);
    dummyFixturesTemp.sort(ArraySorting.sortObjectByKey('date'));
    this.dataSource = new MatTableDataSource<any>(dummyFixturesTemp);
    this.tableLength = value.length;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      return data[sortHeaderId].toLowerCase();
    }
  }

  @Input() displayedCols: string[] = [];

  @Output() actionTrigger = new Subject<any>();

  readonly TABLE_UI_COLUMNS = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly TABLE_COLUMNS = DUMMY_FIXTURE_TABLE_COLUMNS;
  readonly TBD = MatchConstantsSecondary.TO_BE_DECIDED;

  dataSource = new MatTableDataSource<any>([]);
  tableLength = 0;

  onTriggerAction(data: any) {
    if (data.occurred && !data.concluded) {
      this.actionTrigger.next(data[this.TABLE_COLUMNS.MATCH_ID]);
    }
  }

}
