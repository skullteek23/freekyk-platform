import { SeasonAdminService } from '@admin/main-shell/components/season-panel/season-admin.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { GROUNDS_FEATURES_LIST, MatchConstants } from '@shared/constants/constants';
import { seasonFlowMessages } from '@shared/constants/messages';
import { GroundBooking, IGroundInfo, IGroundSelection } from '@shared/interfaces/ground.model';
import { ISelectMatchType } from '@shared/interfaces/season.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ground-slot-selection',
  templateUrl: './ground-slot-selection.component.html',
  styleUrls: ['./ground-slot-selection.component.scss']
})
export class GroundSlotSelectionComponent implements OnInit, OnDestroy {

  readonly labelNA = MatchConstants.LABEL_NOT_AVAILABLE;
  readonly messages = seasonFlowMessages;
  readonly customDateFormat = MatchConstants.GROUND_SLOT_DATE_FORMAT;
  readonly oneHourMilliseconds = 3600000;

  @Input() set ground(value: Partial<IGroundInfo>) {
    if (value && Object.keys(value).length) {
      this.initComponentValues(value);
    }
  };

  bookings: GroundBooking[] = [];
  features: string[] = [];
  groundInfo: Partial<IGroundInfo> = {};
  maxLimit: number = null;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  slots: number[] = [];
  slotSelectionFormControl = new FormControl();
  slotsCache: number[] = [];
  startDateTimestamp: number = null;
  subscriptions = new Subscription();

  constructor(
    private ngFire: AngularFirestore,
    private seasonAdminService: SeasonAdminService
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initComponentValues(value: Partial<IGroundInfo>) {
    this.groundInfo = value;
    this.parseFeatures();
    this.parseTimings();

    this.subscriptions.add(this.slotSelectionFormControl.valueChanges.subscribe((changes: number[]) => {
      this.seasonAdminService.onGroundSelectionChange(({
        id: this.groundInfo.id,
        name: this.groundInfo.name,
        locCity: this.groundInfo.locCity,
        locState: this.groundInfo.locState,
        ownType: this.groundInfo.ownType,
        slots: changes
      } as IGroundSelection));
    }));

    this.ngFire.collection('groundBookings', query => query.where('groundID', '==', this.groundInfo.id)).get().subscribe({
      next: (response) => {
        if (response) {
          this.bookings = response.docs.map(doc => doc.data() as GroundBooking);
        }
      },
      error: (error) => {
      },
    });
  }

  onChooseDate() {
    if (this.start?.value && this.end?.value) {
      const start = new Date(this.start.value).getTime();
      const end = new Date(this.end.value).getTime();
      this.slots = this.slotsCache.filter(slot => slot >= start && slot <= end);
    } else {
      this.slots = this.slotsCache;
    }
  }

  parseFeatures() {
    this.features = [];
    if (this.groundInfo.foodBev) {
      this.features.push(GROUNDS_FEATURES_LIST.foodBev);
    }
    if (this.groundInfo.goalpost) {
      this.features.push(GROUNDS_FEATURES_LIST.goalpost);
    }
    if (this.groundInfo.parking) {
      this.features.push(GROUNDS_FEATURES_LIST.parking);
    }
    if (this.groundInfo.staff) {
      this.features.push(GROUNDS_FEATURES_LIST.staff);
    }
    if (this.groundInfo.washroom) {
      this.features.push(GROUNDS_FEATURES_LIST.washroom);
    }
    if (this.groundInfo.referee) {
      this.features.push(GROUNDS_FEATURES_LIST.referee);
    }
  }

  parseTimings() {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    if (selectMatchTypeFormData && Object.keys(selectMatchTypeFormData).length) {
      this.startDateTimestamp = new Date(selectMatchTypeFormData.startDate).getTime();
      this.maxLimit = this.seasonAdminService.getTotalMatches(selectMatchTypeFormData.containingTournaments, selectMatchTypeFormData.participatingTeamsCount);
    }
    const startDate = new Date(this.startDateTimestamp);
    const endDate = new Date(this.startDateTimestamp);
    const startDateMonth = startDate.getMonth();
    const endDateMonth = startDateMonth + 3;
    endDate.setMonth(endDateMonth);
    const endDateYear = endDate.getFullYear();
    endDate.setDate(this.getLastDay(endDateYear, endDateMonth));
    const start = this.startDateTimestamp;
    const end = endDate.getTime();
    this.slotsCache = this.getRange(start, end, this.groundInfo.timings);
    this.slots = JSON.parse(JSON.stringify(this.slotsCache));
  }

  getRange(start: number, end: number, timings: any): number[] {
    const range: number[] = [];
    for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
      const timeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      const day = dt.getDay();
      if (timings.hasOwnProperty(day)) {
        for (let i = 0; i < timeArray.length; i++) {
          const hour = timeArray[i];
          if ((timings[day] as number[]).includes(hour)) {
            const dtCopy = new Date(JSON.parse(JSON.stringify(dt)));
            dtCopy.setHours(hour);
            range.push(dtCopy.getTime());
          }
        }
      }
    }
    return range.sort();
  };

  getLastDay(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  isSlotBooked(value: number): boolean {
    return this.bookings.findIndex(el => el.slotTimestamp === value) > -1;
  }

  get isAboveMaxSlot(): boolean {
    return this.slotSelectionFormControl?.value?.length > this.maxLimit;
  }

  get start(): AbstractControl {
    return this.range?.get('start');
  }

  get end(): AbstractControl {
    return this.range?.get('end');
  }

  get isInvalidStartDate(): boolean {
    if (!this.start?.value) {
      return false;
    }
    return new Date(this.start.value).getTime() < this.startDateTimestamp;
  }
  get selectedSlots(): number[] {
    return this.slotSelectionFormControl?.value || [];
  }

}
