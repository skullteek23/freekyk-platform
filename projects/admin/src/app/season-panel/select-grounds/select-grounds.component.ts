import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroundBookings, GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';

@Component({
  selector: 'app-select-grounds',
  templateUrl: './select-grounds.component.html',
  styleUrls: ['./select-grounds.component.css']
})
export class SelectGroundsComponent implements OnInit, OnDestroy {

  bookingsList: GroundBookings[] = [];
  groundsForm = new FormGroup({});
  lines = [];
  location: any;
  subscriptions = new Subscription();
  seasonStartDate: any;

  @Input() grounds = [];
  @Input() set data(value: any) {
    if (!value) {
      return;
    }
    this.seasonStartDate = value ? value['startDate'] : null;
    const teams = value ? value['participatingTeamsCount'] : null;
    const tournaments = value ? this.getTournaments(teams, value['containingTournaments']) : null;
    const startDate = value ? value['startDate'] : null;
    this.location = {
      state: value['state'],
      city: value['city']
    }
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
      ]
    } else {
      this.lines = [];
      this.location = {};
    }
  }

  @ViewChild(MatSelectionList) list: MatSelectionList;

  constructor(private ngFire: AngularFirestore) { }

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
    this.subscriptions.add(this.ngFire.collection('groundBookings').valueChanges().subscribe((bookings: GroundBookings[]) => {
      if (bookings && bookings.length) {
        this.bookingsList = bookings;
      } else {
        this.bookingsList = []
      }
    }))
  }

  initForm(): void {
    this.groundsForm = new FormGroup({
      groundsList: new FormControl(null, Validators.required)
    })
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

  getAvailableDays(timings: {}) {
    const availDays: string[] = [];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (timings.hasOwnProperty(i)) {
        availDays.push(days[i]);
      }
    }
    const lastElement = availDays.splice(availDays.length - 1, 1)
    return availDays.slice().join(', ').concat(' & ').concat(lastElement[0]);
  }

  getBooking(groundID: string) {
    return this.bookingsList && this.bookingsList.length ? this.bookingsList.find(booking => booking.groundID === groundID) : null;
  }

  isGroundDisabled(ground: GroundPrivateInfo): boolean {
    let isGroundUnavailable = false;
    const existingBooking = this.getBooking(ground.id);
    const startDate = new Date(this.seasonStartDate).getTime();
    const contractStartDate = ground['contractStartDate'] || 0;
    const contractEndDate = ground['contractEndDate'] || 0;

    if (existingBooking) {
      const unavailableFrom = existingBooking.bookingFrom;
      const unavailableTo = existingBooking.bookingTo;
      isGroundUnavailable = (startDate && unavailableFrom && unavailableTo && ((startDate > unavailableFrom) || (startDate < unavailableTo)));
    }
    if (startDate && contractEndDate && contractStartDate && ((startDate > contractEndDate) || (startDate < contractStartDate))) {
      isGroundUnavailable = true;
    }
    return isGroundUnavailable;
  }
  getAvailableDate(groundID: string) {
    return this.getBooking(groundID)?.bookingTo;
  }
}
