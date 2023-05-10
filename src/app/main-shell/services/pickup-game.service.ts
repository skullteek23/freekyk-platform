import { CurrencyPipe, DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { MatchConstants } from '@shared/constants/constants';
import { ILockedSlot, IPickupGameSlot, ISlotOption } from '@shared/interfaces/game.model';
import { MatchFixture } from '@shared/interfaces/match.model';
import { IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { ListOption } from '@shared/interfaces/others.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import { IPaymentOptionModes, IPaymentOptions, IPaymentOptionsDialogData } from '../components/payment-options-pickup-game/payment-options-pickup-game.component';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import { MatDialog } from '@angular/material/dialog';
import { WaitingListDialogComponent } from '../components/waiting-list-dialog/waiting-list-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PickupGameService {

  constructor(
    private router: Router,
    private apiPostService: ApiPostService,
    private apiService: ApiGetService,
    private datePipe: DatePipe,
    private paymentService: PaymentService,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog
  ) { }

  getStartDate(date: number): string {
    if (date) {
      const today = new Date().getTime();
      const timeDiff = Math.abs(date - today);
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays === 0) {
        return 'today';
      } else if (diffDays === 1) {
        return 'tomorrow';
      } else {
        return `in ${diffDays} days`;
      }
    }
  }

  createSlots(response: IPickupGameSlot[]): Partial<ISlotOption>[] {
    const result: Partial<ISlotOption>[] = [];
    if (response) {
      response.forEach(el => {
        if (Array.isArray(el.slots)) {
          el.slots.forEach((position, index) => {
            const slot: Partial<ISlotOption> = {
              name: this.getShortenText(el.name, 8) + this.getEnumerableIndex(index),
              booked: true,
              selected: false,
              uid: el.uid,
              position: position
            }
            result.push(slot);
          });
        }
      });
    }
    return result;
  }

  getReportingTime(date: number): number {
    return date - (MatchConstants.ONE_HOUR_IN_MILLIS / 4);
  }

  getEmptySlot(index: number): Partial<ISlotOption> {
    return {
      name: '',
      booked: false,
      selected: false,
      uid: null,
      position: index
    }
  }

  getMatchGround(match: MatchFixture): ListOption {
    if (!match) {
      return { value: null, viewValue: MatchConstants.LABEL_NOT_AVAILABLE };
    }
    return { viewValue: match.ground, value: match.groundID } as ListOption;
  }

  getEnumerableIndex(index: number) {
    if (index >= 1) {
      return `+${index}`;
    }
    return '';
  }

  getShortenText(value: string, maxLength: number): string {
    if (!!value) {
      return value.length > maxLength
        ? value.slice(0, maxLength).concat('...')
        : value;
    }
    return value;
  }

  redirectToUrl(path: string, encodePath: string): void {
    const encodedString = encodeURIComponent(encodePath);
    this.router.navigate([path], { queryParams: { callback: encodedString } });
  }

  isLockExpired(timestamp: number): boolean {
    const current = new Date().getTime();
    const diff = current - timestamp;
    return diff > MatchConstants.FIVE_MINUTES_IN_MILLIS;
  }

  openOrder(orderID: string) {
    if (orderID) {
      this.router.navigate(['/order', orderID])
    }
  }

  deleteLock(docID: string) {
    this.apiPostService.deleteLockedPickupSlot(docID);
  }

  saveInfo(data: { displaySlots: Partial<ISlotOption>[], allSlots: IPickupGameSlot[], uid: string, season: Partial<SeasonAllInfo>, response?: any }): Promise<any> {
    let pickupSlotID = this.apiService.getUniqueDocID();
    const allPromises = [];
    const totalSlots = data.displaySlots.filter(el => el.selected).length;
    const selectedPositions: number[] = [];
    const update: Partial<IPickupGameSlot> = {
      slots: selectedPositions
    }
    const existingSlot = data.allSlots?.find(el => el.uid === data.uid);
    const options: Partial<RazorPayOrder> = {
      notes: {
        seasonID: data.season.id,
        seasonName: data.season.name,
        itemQty: totalSlots,
        itemCancelledQty: 0,
        itemID: pickupSlotID,
        itemName: `Pickup Game Slots`,
        itemType: IItemType.pickupSlot,
        logs: [
          `Purchased ${totalSlots} slot(s) on ${this.datePipe.transform(new Date(), 'short')}`
        ]
      }
    }

    data.displaySlots.forEach(slot => {
      if (slot.selected) {
        selectedPositions.push(slot.position);
      }
    });

    if (existingSlot?.hasOwnProperty('slots')) {
      pickupSlotID = existingSlot.id;
      update.slots = update.slots.concat(existingSlot.slots);
      allPromises.push(this.apiPostService.updatePickupSlot(existingSlot.id, update));
    } else {
      const addData: IPickupGameSlot = {
        slots: selectedPositions,
        uid: data.uid,
        timestamp: new Date().getTime(),
        seasonID: data.season.id,
      }
      allPromises.push(this.apiPostService.savePickupSlotWithCustomID(pickupSlotID, addData));
    }
    allPromises.push(this.paymentService.saveOrder(options, data.response).toPromise());

    return Promise.all(allPromises);
  }

  saveInfoForPointsPayment(data: { displaySlots: Partial<ISlotOption>[], allSlots: IPickupGameSlot[], uid: string, season: Partial<SeasonAllInfo>, amount: number, orderID: string }): Promise<any> {
    let pickupSlotID = this.apiService.getUniqueDocID();
    const allPromises = [];
    const totalSlots = data.displaySlots.filter(el => el.selected).length;
    const selectedPositions: number[] = [];
    const update: Partial<IPickupGameSlot> = {
      slots: selectedPositions
    }
    const existingSlot = data.allSlots?.find(el => el.uid === data.uid);

    data.displaySlots.forEach(slot => {
      if (slot.selected) {
        selectedPositions.push(slot.position);
      }
    });

    if (existingSlot?.hasOwnProperty('slots')) {
      pickupSlotID = existingSlot.id;
      update.slots = update.slots.concat(existingSlot.slots);
      allPromises.push(this.apiPostService.updatePickupSlot(existingSlot.id, update));
    } else {
      const addData: IPickupGameSlot = {
        slots: selectedPositions,
        uid: data.uid,
        timestamp: new Date().getTime(),
        seasonID: data.season.id,
      }
      allPromises.push(this.apiPostService.savePickupSlotWithCustomID(pickupSlotID, addData));
    }

    const order: Partial<RazorPayOrder> = {
      amount: data.amount * 100,
      amount_due: 0,
      amount_paid: data.amount * 100,
      attempts: 1,
      created_at: new Date().getTime() / 1000,
      currency: 'Freekyk Points',
      entity: 'order',
      id: data.orderID,
      status: 'paid',
      razorpay_payment_id: null,
      notes: {
        seasonID: data.season.id,
        seasonName: data.season.name,
        itemQty: totalSlots,
        itemCancelledQty: 0,
        itemID: pickupSlotID,
        itemName: `Pickup Game Slots`,
        itemType: IItemType.pickupSlot,
        logs: [
          `Purchased ${totalSlots} slot(s) on ${this.datePipe.transform(new Date(), 'short')}`
        ],
        pointsUsed: data.amount,

      },
      offer_id: null,
      receipt: data.uid,
    }
    allPromises.push(this.paymentService.savePointsOrder(data.orderID, order));
    return Promise.all(allPromises);
  }

  saveOrder() {

  }

  async lockSlot(uid: string, lockID: string, seasonID: string, slots: Partial<ISlotOption>[]): Promise<any> {
    const selectedSlots: number[] = [];
    slots.forEach(dpSlot => {
      if (dpSlot.selected) {
        selectedSlots.push(dpSlot.position);
      }
    })
    if (selectedSlots.length && lockID) {
      const data: ILockedSlot = {
        uid,
        seasonID: seasonID,
        lockedSlots: selectedSlots,
        timestamp: new Date().getTime()
      }
      try {
        await this.apiPostService.lockPickupSlot(lockID, data)
        return true;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  getPaymentOptions(points: number, amount: number, slots: number): MatBottomSheetConfig {
    const bookingAmount = 10;
    const options = new MatBottomSheetConfig();
    const dataOptions: IPaymentOptions[] = [];
    dataOptions.push({
      label: `Pay with Freekyk Points (Balance: ${points})`,
      icon: 'payments',
      disabled: points <= 0,
      mode: IPaymentOptionModes.freekykPoints,
      amount,
    });
    dataOptions.push({
      label: `Pay Now: ${this.currencyPipe.transform(amount, 'INR')}`,
      icon: 'account_balance',
      disabled: false,
      mode: IPaymentOptionModes.payNow,
      amount: amount,
    });
    dataOptions.push({
      label: `Book Now & Pay at Venue`,
      icon: 'book_online',
      disabled: false,
      mode: null,
      amount: amount,
      subOption: [
        {
          label: `Book @ ${this.currencyPipe.transform(bookingAmount, 'INR')}, Pay remaining in cash`,
          icon: 'local_atm',
          disabled: false,
          mode: IPaymentOptionModes.bookWithCash,
          amount: amount,
        },
        {
          label: `Book @ ${this.currencyPipe.transform(bookingAmount, 'INR')}, Pay remaining online`,
          icon: 'add_card',
          disabled: false,
          mode: IPaymentOptionModes.bookOnline,
          amount: amount,
        },
      ]
    });
    const data: IPaymentOptionsDialogData = {
      slotsCount: slots,
      amount,
      options: dataOptions
    }
    options.data = data;
    return options;
  }

  getWaitingList(seasonID: string) {
    return this.apiService.getSeasonWaitingList(seasonID).toPromise();
  }

  async isSlotLocked(displayedSlots: Partial<ISlotOption>[], seasonID: string): Promise<boolean> {
    const lockedSlot: ILockedSlot = await this.apiService.getLockedSlots(seasonID).toPromise();
    if (lockedSlot?.lockedSlots?.length) {
      return displayedSlots.some(element =>
        element.selected
        && lockedSlot.lockedSlots.includes(element.position)
        && !this.isLockExpired(lockedSlot.timestamp)
      );
    }
    return false;
  }

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  async openWaitingList(isLoggedIn: boolean, isOnBoarded: boolean, season: Partial<SeasonAllInfo>) {
    if (isLoggedIn && isOnBoarded) {
      // User has completed signup and onboarding
      this.dialog.open(WaitingListDialogComponent, {
        panelClass: 'fk-dialogs',
        data: season,
      });
    } else if (isLoggedIn && !isOnBoarded) {
      // User is signed up but not on-boarded
      this.redirectToUrl('/onboarding', `/pickup-game/${season.id}`);
    } else {
      // User is not signed up
      this.redirectToUrl('/signup', `/pickup-game/${season.id}`);
    }
  }
}
