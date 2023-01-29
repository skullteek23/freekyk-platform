import { Component, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { Formatters, IDummyFixture, MatchStatus } from '@shared/interfaces/match.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { DUMMY_FIXTURE_TABLE_COLUMNS, DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS, MatchConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-fixture-table',
  templateUrl: './fixture-table.component.html',
  styleUrls: ['./fixture-table.component.scss']
})
export class FixtureTableComponent {

  readonly MatchStatusEnum = MatchStatus;

  @Input() set data(value: IDummyFixture[]) {
    const dummyFixturesTemp = value.map(val => ({
      [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: val.id,
      [DUMMY_FIXTURE_TABLE_COLUMNS.HOME]: val.home,
      [DUMMY_FIXTURE_TABLE_COLUMNS.AWAY]: val.away,
      [DUMMY_FIXTURE_TABLE_COLUMNS.DATE]: val.date,
      // [DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION]: `${val.locCity}, ${val.locState}`,
      [DUMMY_FIXTURE_TABLE_COLUMNS.GROUND]: val.ground,
      [DUMMY_FIXTURE_TABLE_COLUMNS.STATUS]: MatchStatus[val.status],
      statusCode: MatchStatus[val.status],
      statusTooltip: this.formatter?.formatStatus(val.status).shortMsg,
      isCancelAllowed: this.getCancelPermission(val.status),
      isAbortAllowed: this.getAbortPermission(val.status, val.date),
      isRescheduleAllowed: this.getReschedulePermission(val.status, val.date),
      isMatchReportUpdateAllowed: this.getUploadMatchReportPermission(val.status, val.date)
    }), this);
    dummyFixturesTemp.sort(ArraySorting.sortObjectByKey('date'));
    this.dataSource = new MatTableDataSource<any>(dummyFixturesTemp);
    this.tableLength = value.length;
  }

  @Input() displayedCols: string[] = [];
  @Output() statusChange = new Subject<{ matchID: string, status: MatchStatus }>();

  readonly tableUIColumns = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly tableColumns = DUMMY_FIXTURE_TABLE_COLUMNS;

  dataSource = new MatTableDataSource<any>([]);
  tableLength = 0;
  formatter: any;
  validStatusList: string[] = Object.keys(MatchStatus).filter((v) => isNaN(Number(v)));;

  constructor() {
    this.formatter = Formatters;
  }

  getCancelPermission(status: number) {
    if (status === null || status === undefined) {
      return false;
    } else if (status === MatchStatus.ABT || status === MatchStatus.STU || status === MatchStatus.CAN || status === MatchStatus.CNS || status === MatchStatus.STD) {
      return false;
    }
    return true;
  }

  getAbortPermission(status: number, date: number) {
    const comparator = new Date().getTime();
    if (status === null || status === undefined) {
      return false;
    } else if (date > comparator) {
      return false;
    } else if (status === MatchStatus.ABT || status === MatchStatus.RES || status === MatchStatus.STU || status === MatchStatus.CAN || status === MatchStatus.CNS || status === MatchStatus.STD) {
      return false;
    }
    return true;
  }

  getReschedulePermission(status: number, date: number) {
    const currentTimestamp = new Date().getTime();
    const comparator = currentTimestamp - MatchConstants.RESCHEDULE_MINIMUM_GAP_MILLISECONDS;
    if (status === null || status === undefined) {
      return false;
    } else if (status === MatchStatus.ONT && comparator <= date) {
      return true;
    }
    return false;
  }

  getUploadMatchReportPermission(status: number, date: number) {
    if (status === null || status === undefined) {
      return false;
    } else if (status === MatchStatus.ABT || status === MatchStatus.CAN || status === MatchStatus.CNS) {
      return false;
    }
    return true;
  }

  changeStatus(matchID: string, status: MatchStatus, allowedOperation: boolean) {
    if (allowedOperation) {
      this.statusChange.next({ matchID, status });
    }
  }

}
