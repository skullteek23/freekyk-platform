import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ReportData } from 'src/app/shared/interfaces/match.model';

@Component({
  selector: 'app-match-report-summary',
  templateUrl: './match-report-summary.component.html',
  styleUrls: ['./match-report-summary.component.css']
})
export class MatchReportSummaryComponent {

  @Input() title = '';
  @Input() set data(value: ReportData) {
    if (value) {
      this.cols = value.cols;
      this.displayCols = value.displayCols;
      this.setDataSource(value.dataSource);
    } else {
      this.cols = [];
      this.displayCols = [];
      this.setDataSource([]);
    }
  }

  cols: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayCols: string[] = [];

  setDataSource(data: any) {
    this.dataSource = new MatTableDataSource<any>(data);
  }

}
