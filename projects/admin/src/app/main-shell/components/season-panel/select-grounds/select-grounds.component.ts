import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { Subscription } from 'rxjs';
import { GroundBooking, GroundPrivateInfo } from '@shared/interfaces/ground.model';
import { MatchConstants } from '@shared/constants/constants';
import { SeasonAdminService } from '../season-admin.service';

@Component({
  selector: 'app-select-grounds',
  templateUrl: './select-grounds.component.html',
  styleUrls: ['./select-grounds.component.scss'],
})
export class SelectGroundsComponent implements OnInit, OnDestroy {

  @Input() grounds = [];
  @Input() set data(value: any) {
    if (!value) {
      return;
    }
    this.seasonStartDate = value ? value.startDate : null;
    const teams = value ? value.participatingTeamsCount : null;
    const tournaments = value ? this.getTournaments(teams, value.containingTournaments) : null;
    const startDate = value ? value.startDate : null;
    this.location = {
      state: value.state,
      city: value.city
    };
    if (tournaments && startDate && teams) {
      this.lines = [
        {
          heading: 'Teams Participating',
          content: teams
        },
        {
          heading: 'Tournaments to be held',
          content: tournaments
        },
        {
          heading: 'Start Date',
          content: startDate
        },
      ];
    } else {
      this.lines = [];
      this.location = {};
    }
  }

  @ViewChild(MatSelectionList) list: MatSelectionList;

  bookingsList: GroundBooking[] = [];
  groundsForm = new FormGroup({});
  lines = [];
  location: any;
  subscriptions = new Subscription();
  seasonStartDate: any;


  constructor(
    private ngFire: AngularFirestore,
    private seasonAdminService: SeasonAdminService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkGroundBookings();
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onAddGround() {
    //
  }

  checkGroundBookings() {
    this.subscriptions.add(this.ngFire.collection('groundBookings').valueChanges().subscribe((bookings: GroundBooking[]) => {
      if (bookings && bookings.length) {
        this.bookingsList = bookings;
      } else {
        this.bookingsList = [];
      }
    }));
  }

  initForm(): void {
    this.groundsForm = new FormGroup({
      groundsList: new FormControl(null, Validators.required)
    });
  }

  onChooseGround() {
    const options = this.list.selectedOptions.selected;
    const selectedGrounds = [];
    options.forEach(option => {
      selectedGrounds.push(option.value);
    });
    if (selectedGrounds.length) {
      this.groundsForm.setValue({
        groundsList: selectedGrounds
      });
    } else {
      this.initForm();
    }
  }

  getTournaments(participatingTeams: number, containingTournaments: string[]): string {
    let fkc = 0;
    let fcp = 0;
    let fpl = 0;
    if (containingTournaments.includes('FCP')) {
      fcp = participatingTeams === 2 ? 1 : participatingTeams / 2;
    }
    if (containingTournaments.includes('FKC') && participatingTeams % 4 === 0) {
      fkc = 1;
    }
    if (containingTournaments.includes('FPL') && participatingTeams > 2) {
      fpl = 1;
    }
    return `${fcp} FCP, ${fkc} FKC and ${fpl} FPL`;
  }

  getAvailableDays(timings: any) {
    const availDays: string[] = [];
    const days = MatchConstants.DAYS_LIST_FULL;
    for (let i = 0; i < days.length; i++) {
      if (timings.hasOwnProperty(i)) {
        availDays.push(days[i]);
      }
    }
    const lastElement = availDays.splice(availDays.length - 1, 1);
    return availDays.slice().join(', ').concat(' & ').concat(lastElement[0]);
  }

  getBooking(groundID: string): GroundBooking {
    return this.bookingsList && this.bookingsList.length ? this.bookingsList.find(booking => booking.groundID === groundID) : null;
  }

  isGroundDisabled(ground: GroundPrivateInfo): boolean {
    const startDate = new Date(this.seasonStartDate).getTime();
    const existingBooking: GroundBooking = this.getBooking(ground.id);
    return startDate && existingBooking ? this.seasonAdminService.isStartDateOverlap(startDate, existingBooking) : false;
  }

  getUnavailability(groundID: string): string {
    // const booking = this.getBooking(groundID);
    // const unavailableFrom = this.datePipe.transform(booking.bookingFrom, 'mediumDate');
    // const unavailableTo = this.datePipe.transform(booking.bookingTo, 'mediumDate');
    // return `Ground not available from ${unavailableFrom} till ${unavailableTo}`;
    return '';
  }
}
