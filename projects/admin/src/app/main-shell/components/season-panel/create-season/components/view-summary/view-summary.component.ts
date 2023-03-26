import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { Formatters } from '@shared/interfaces/match.model';
import { ISeasonSummaryData, ISummaryDataSource, ISelectMatchType, ISelectTeam, ISelectGrounds, ISeasonFixtures, ISeasonDetails } from '@shared/interfaces/season.model';
import { PaymentService } from '@shared/services/payment.service';

@Component({
  selector: 'app-view-summary',
  templateUrl: './view-summary.component.html',
  styleUrls: ['./view-summary.component.scss'],
  providers: [DatePipe, CurrencyPipe]
})
export class ViewSummaryComponent implements OnInit {

  @Output() clickNext = new EventEmitter<void>();

  cols = ['label', 'value'];
  summaryData: Partial<ISeasonSummaryData>;
  dataSource = new MatTableDataSource<ISummaryDataSource>([]);
  formatter: any;

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private paymentService: PaymentService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.formatter = Formatters;
    this.initSummary();
    this.setDataSource();
  }

  initSummary() {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    const selectTeamFormData: ISelectTeam = JSON.parse(sessionStorage.getItem('selectTeam'));
    const selectGroundFormData: ISelectGrounds = JSON.parse(sessionStorage.getItem('selectGround'));
    const seasonFixturesFormData: ISeasonFixtures = JSON.parse(sessionStorage.getItem('seasonFixtures'));
    const seasonDetailsFormData: ISeasonDetails = JSON.parse(sessionStorage.getItem('seasonDetails'));
    const data: Partial<ISeasonSummaryData> = {};
    if (selectMatchTypeFormData && selectGroundFormData && seasonDetailsFormData && seasonFixturesFormData && seasonFixturesFormData?.fixtures?.length) {
      data.name = seasonDetailsFormData.name;
      data.startDate = this.getDate(seasonFixturesFormData?.fixtures[0]?.date, 'fullDate');
      data.endDate = this.getDate(seasonFixturesFormData?.fixtures[seasonFixturesFormData?.fixtures?.length - 1]?.date, 'fullDate');
      data.grounds = selectGroundFormData.map(ground => ground.name).join(", ");
      data.location = selectMatchTypeFormData.location.city + ", " + selectMatchTypeFormData.location.state + ", India";
      // data.discount = seasonDetailsFormData.discount;
      data.type = selectMatchTypeFormData.type;

      let finalFees = seasonDetailsFormData.fees.toString();
      // if (seasonDetailsFormData.discount > 0) {
      //   finalFees = this.paymentService.getFeesAfterDiscount(seasonDetailsFormData.fees, seasonDetailsFormData.discount).toString();
      // }
      data.fees = this.currencyPipe.transform(finalFees, 'INR');

      if (selectTeamFormData) {
        data.participants = selectTeamFormData.participants.map(team => team.name).join(", ");
      } else {
        data.participants = 'Any team can participate';
      }
    } else {
      this.snackbarService.displayError('Please finish previous steps!');
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
      data.push({ label: 'Season Name', value: this.summaryData.name });
      data.push({ label: 'Location', value: this.summaryData.location });
      data.push({ label: 'Season Starts on', value: this.summaryData.startDate });
      data.push({ label: 'Allowed Participants', value: this.summaryData.participants });
      // data.push({ label: 'Discount (%)', value: this.summaryData.discount });
      data.push({ label: 'Entry Fees (per team)', value: this.summaryData.fees });
      data.push({ label: 'Tournament Type', value: this.formatter.formatTournamentType(this.summaryData.type) });
      data.push({ label: 'Stadiums', value: this.summaryData.grounds });
      data.push({ label: 'Season Ends on', value: this.summaryData.endDate });
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
