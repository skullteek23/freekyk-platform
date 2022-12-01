import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatchConstants } from '@shared/constants/constants';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { IGroundAvailability, IGroundDetails, IGroundSummaryData } from '@shared/interfaces/ground.model';
import { ISummaryDataSource } from '@shared/interfaces/season.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-ground-form-summary',
  templateUrl: './ground-form-summary.component.html',
  styleUrls: ['./ground-form-summary.component.scss'],
  providers: [DatePipe]
})
export class GroundFormSummaryComponent implements OnInit {

  @Output() clickNext = new EventEmitter<void>();

  cols = ['label', 'value'];
  summaryData: Partial<IGroundSummaryData>;
  dataSource = new MatTableDataSource<ISummaryDataSource>([]);

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.initSummary();
    this.setDataSource();
  }

  initSummary() {
    const groundDetails: IGroundDetails = JSON.parse(sessionStorage.getItem('groundDetails'));
    const groundAvailability: IGroundAvailability = JSON.parse(sessionStorage.getItem('groundAvailability'));
    const data: Partial<IGroundSummaryData> = {};
    if (groundDetails && groundAvailability && groundAvailability.length) {
      const daysArray = groundAvailability.map(el => el.day);
      const start = this.getDate(new Date(groundDetails.contract.start).getTime(), MatchConstants.GROUND_CONTRACT_DATE_FORMAT);
      const end = this.getDate(new Date(groundDetails.contract.end).getTime(), MatchConstants.GROUND_CONTRACT_DATE_FORMAT);
      data.name = groundDetails.name;
      data.type = groundDetails.type;
      data.location = groundDetails.location.city + ", " + groundDetails.location.state;
      data.timings = _.uniq(daysArray).join(", ");
      data.contractRange = `${start} - ${end}`;
    }
    this.summaryData = data;
  }

  getDate(value: number, format: string) {
    if (value) {
      return this.datePipe.transform(value, format)
    }
    return MatchConstants.LABEL_NOT_AVAILABLE;
  }

  setDataSource() {
    if (this.summaryData) {
      const data: ISummaryDataSource[] = [];
      data.push({ label: 'Ground Name', value: this.summaryData.name });
      data.push({ label: 'Location', value: this.summaryData.location });
      data.push({ label: 'Ground Type', value: this.summaryData.type });
      data.push({ label: 'Selected Days', value: this.summaryData.timings });
      this.dataSource = new MatTableDataSource<ISummaryDataSource>(data);
    }
  }

  next() {
    this.dialog.open(ConfirmationBoxComponent)
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            this.clickNext.emit();
          }
        }
      });
  }

}
