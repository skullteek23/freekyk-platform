import { Component, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { IDummyFixture } from '@shared/interfaces/match.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { DUMMY_FIXTURE_TABLE_COLUMNS, DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS } from '@shared/constants/constants';

@Component({
  selector: 'app-fixture-table',
  templateUrl: './fixture-table.component.html',
  styleUrls: ['./fixture-table.component.scss']
})
export class FixtureTableComponent {

  @Input() set data(value: IDummyFixture[]) {
    const currentDate = new Date().getTime();
    const dummyFixturesTemp = value.map(val => ({
      [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: val.id,
      [DUMMY_FIXTURE_TABLE_COLUMNS.HOME]: val.home,
      [DUMMY_FIXTURE_TABLE_COLUMNS.AWAY]: val.away,
      [DUMMY_FIXTURE_TABLE_COLUMNS.DATE]: val.date,
      [DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION]: `${val.locCity}, ${val.locState}`,
      [DUMMY_FIXTURE_TABLE_COLUMNS.GROUND]: val.stadium,
      occurred: currentDate > val.date,
      concluded: val.concluded,
      action: val.concluded ? 'Submitted' : 'Update Match'
    }), this);
    dummyFixturesTemp.sort(ArraySorting.sortObjectByKey('date'));
    this.dataSource = new MatTableDataSource<any>(dummyFixturesTemp);
    this.tableLength = value.length;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => data[sortHeaderId].toLowerCase();
  }

  @Input() displayedCols: string[] = [];

  @Output() actionTrigger = new Subject<any>();

  readonly tableUIColumns = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly tableColumns = DUMMY_FIXTURE_TABLE_COLUMNS;

  dataSource = new MatTableDataSource<any>([]);
  tableLength = 0;

  onTriggerAction(data: any) {
    if (data.occurred && !data.concluded) {
      this.actionTrigger.next(data[this.tableColumns.MATCH_ID]);
    }
  }

}
