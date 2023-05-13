import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@shared/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { Formatters } from '@shared/interfaces/match.model';
import { ISeasonSummaryData, ISummaryDataSource, ISelectMatchType, ISelectTeam, ISelectGrounds, ISeasonFixtures, ISeasonDetails } from '@shared/interfaces/season.model';
import { PaymentService } from '@shared/services/payment.service';
import { Formatters as TeamFormatters } from '@shared/interfaces/team.model';
import { RemoveUnchangedKeysFromFormGroup } from '@shared/utils/custom-functions';

@Component({
  selector: 'app-view-summary',
  templateUrl: './view-summary.component.html',
  styleUrls: ['./view-summary.component.scss'],
  providers: [DatePipe, CurrencyPipe]
})
export class ViewSummaryComponent implements OnInit {

  @Output() clickNext = new EventEmitter<void>();
  @Input() set data(value: any) {
    if (value) {
      this.initSummary(value);
      this.setDataSource();
    }
  }

  cols = ['label', 'value'];
  summaryData: Partial<ISeasonSummaryData>;
  dataSource = new MatTableDataSource<ISummaryDataSource>([]);
  formatter = Formatters;
  teamFormatter = TeamFormatters;

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) { }

  ngOnInit(): void { }

  initSummary(value: any) {
    const data: any = {};
    data.name = value?.name;
    data.reportingTime = this.getDate(new Date(value?.startDate).getTime() - (MatchConstants.ONE_HOUR_IN_MILLIS / 4), 'shortTime');
    data.startDate = this.getDate(value?.startDate, 'medium');
    data.endDate = this.getDate(new Date(value?.startDate).getTime() + MatchConstants.ONE_HOUR_IN_MILLIS, 'shortTime');
    data.grounds = value.groundName;
    data.location = `${value.location.city}, ${value.location.state}, India`;
    data.type = this.formatter.formatTournamentType(value.type);
    data.fees = `${this.currencyPipe.transform(value.fees, 'INR')} (per Player)`;
    data.format = `${value.format}v${value.format}`;
    data.allowedAgeCategory = this.teamFormatter.formatAgeCategory(value.allowedAgeCategory).viewValue;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && data[key] === null || data[key] === undefined || data[key] === '') {
        data[key] = MatchConstants.LABEL_NOT_AVAILABLE;
      }
    }
    this.summaryData = JSON.parse(JSON.stringify(data));
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
      data.push({ label: 'Name', value: this.summaryData.name });
      data.push({ label: 'Format', value: this.summaryData.format });
      data.push({ label: 'Type', value: this.summaryData.type });
      data.push({ label: 'Reporting Time', value: this.summaryData.reportingTime });
      data.push({ label: 'Timings', value: `${this.summaryData.startDate} - ${this.summaryData.endDate}` });
      data.push({ label: 'Location', value: this.summaryData.location });
      data.push({ label: 'Age Category', value: this.summaryData.allowedAgeCategory });
      data.push({ label: 'Fees', value: this.summaryData.fees });
      data.push({ label: 'Ground(s)', value: this.summaryData.grounds });

      this.dataSource = new MatTableDataSource<ISummaryDataSource>(data);

      const element = document.getElementById('view-summary-submit-button');
      element.scrollIntoView({ behavior: 'smooth' })
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
