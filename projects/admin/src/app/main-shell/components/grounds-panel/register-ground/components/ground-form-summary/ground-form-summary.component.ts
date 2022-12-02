import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatchConstants } from '@shared/constants/constants';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { IGroundAvailability, IGroundDetails, IGroundSummaryData, Formatters } from '@shared/interfaces/ground.model';
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
    const formatter = Formatters;
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
      data.playLvl = groundDetails.playLvl;
      data.fieldType = formatter.formatTurf(groundDetails.fieldType);
      data.referee = this.getTruthyValue(groundDetails.referee);
      data.foodBev = this.getTruthyValue(groundDetails.foodBev);
      data.parking = this.getTruthyValue(groundDetails.parking);
      data.goalpost = this.getTruthyValue(groundDetails.goalpost);
      data.washroom = this.getTruthyValue(groundDetails.washroom);
      data.staff = this.getTruthyValue(groundDetails.staff);
    }
    this.summaryData = data;
  }

  getTruthyValue(value: boolean): string {
    return value ? 'Yes' : 'No';
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
      data.push({ label: 'Ground Ownership', value: this.summaryData.type });
      data.push({ label: 'Selected Days', value: this.summaryData.timings });
      data.push({ label: 'Playability Level', value: this.summaryData.playLvl });
      data.push({ label: 'Field Type', value: this.summaryData.fieldType });
      data.push({ label: 'Referee', value: this.summaryData.referee });
      data.push({ label: 'Food & Beverages', value: this.summaryData.foodBev });
      data.push({ label: 'Parking Available', value: this.summaryData.parking });
      data.push({ label: 'Goalpost', value: this.summaryData.goalpost });
      data.push({ label: 'Washroom Available', value: this.summaryData.washroom });
      data.push({ label: 'Ball Boy (Staff)', value: this.summaryData.staff });
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
