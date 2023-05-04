import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import { ILockedSlot, IPickupGameSlot, ISlotOption } from '@shared/interfaces/game.model';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ICheckoutOptions, RazorPayOrder } from '@shared/interfaces/order.model';
import { ListOption } from '@shared/interfaces/others.model';
import { Formatters } from '@shared/interfaces/team.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { WaitingListDialogComponent } from '../waiting-list-dialog/waiting-list-dialog.component';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';



@Component({
  selector: 'app-pickup-game-profile',
  templateUrl: './pickup-game-profile.component.html',
  styleUrls: ['./pickup-game-profile.component.scss'],
  providers: [DatePipe]
})
export class PickupGameProfileComponent implements AfterViewInit, OnDestroy {

  readonly customDateFormat = MatchConstants.GROUND_SLOT_DATE_FORMAT;
  readonly oneHourMilliseconds = 3600000;

  readonly ONE_SIDE_COUNT = 7;

  seasonID: string = null;
  season: Partial<SeasonAllInfo> = null;
  isLoaderShown = false;
  startDate = '';
  match: MatchFixture;
  ground: ListOption;
  ageCatFormatter: any;
  displayedSlots: Partial<ISlotOption>[] = [];
  allSlots: IPickupGameSlot[] = [];
  reportingTime: number = null;
  payableFees = 0;
  emptySlotsCount = 0;
  playerUID: string = null;
  waitingList: ListOption[] = [];
  subscriptions = new Subscription();
  slotsSubscriptions = new Subscription();
  lockID = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiGetService,
    private router: Router,
    private dialog: MatDialog,
    private paymentService: PaymentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private snackBarService: SnackbarService,
    private apiPostService: ApiPostService,
    private datePipe: DatePipe,
    private generateRewardService: GenerateRewardService
  ) { }

  ngAfterViewInit(): void {
    this.initUser();
    this.ageCatFormatter = Formatters;
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('seasonid')) {
          this.seasonID = params['seasonid'];
          this.getSeasonInfo();
        }
      }
    }));
    this.subscriptions.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart && event?.url?.endsWith('/pay')) {
        this.showLoader();
        this.participate();
      } else if (event instanceof NavigationStart && event?.url?.endsWith('/waiting-list')) {
        this.openWaitingList();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.slotsSubscriptions.unsubscribe();
  }

  initUser() {
    this.authService.isLoggedIn()
      .subscribe(response => {
        if (response) {
          this.playerUID = response.uid;
        }
      });
  }

  getSeasonInfo(): void {
    if (this.seasonID) {
      this.showLoader();
      this.subscriptions.add(this.apiService.getSeasonAllInfo(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.season = response;
              this.seasonID = response.id;
              this.createStartDate();
              this.getSeasonMatches();
              this.getSeasonBookedSlots();

              this.reportingTime = this.season.startDate - (MatchConstants.ONE_HOUR_IN_MILLIS / 4);
              this.payableFees = 0;
            } else {
              this.router.navigate(['error'])
            }
            this.hideLoader();
            window.scrollTo(0, 0);
          },
          error: (error) => {
            this.season = null;
            this.hideLoader();
            window.scrollTo(0, 0);
            this.router.navigate(['/error']);
          }
        }))
    }
  }

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  redirectToUrl(path: string, encodePath: string): void {
    const encodedString = encodeURIComponent(encodePath);
    this.router.navigate([path], { queryParams: { callback: encodedString } });
  }

  getWaitingList() {
    return this.apiService.getSeasonWaitingList(this.seasonID).toPromise();
  }

  getSeasonMatches() {
    if (this.season?.name) {
      this.apiService.getSeasonMatches(this.season.name)
        .subscribe({
          next: (response) => {
            if (response) {
              this.match = response[0];
              this.ground = { viewValue: this.match.ground, value: this.match.groundID }
            }
          },
          error: (error) => {
            this.match = null;
            this.ground = null;
          }
        })
    }
  }

  getSeasonBookedSlots() {
    if (this.seasonID) {
      this.slotsSubscriptions.add(this.apiService.addSeasonSlotListener(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.allSlots = response;
            }
            this.createBookedSlotList();
          },
          error: () => {
            this.allSlots = [];
            this.createBookedSlotList();
          }
        }))
    }
  }

  createStartDate() {
    if (this.season?.startDate) {
      const today = new Date().getTime();
      const timeDiff = Math.abs(this.season.startDate - today);
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays === 0) {
        this.startDate = 'today';
      } else if (diffDays === 1) {
        this.startDate = 'tomorrow';
      } else {
        this.startDate = `in ${diffDays} days`;
      }
    }
  }

  selectSlot(slot: Partial<ISlotOption>, index: number) {
    if (slot.booked) {
      return;
    }
    if (!slot.selected) {
      slot.selected = true;
      this.payableFees += this.season.fees;
    } else {
      slot.selected = false;
      this.payableFees -= this.season.fees;
    }
  }

  async createBookedSlotList() {
    this.displayedSlots = [];
    this.emptySlotsCount = 0;
    this.payableFees = 0;

    // Adding booked slots
    this.allSlots.forEach(el => {
      if (Array.isArray(el.slots)) {
        el.slots.forEach((position, index) => {
          const slot: Partial<ISlotOption> = {
            name: this.getShortenText(el.name, 8) + this.getEnumerableIndex(index),
            booked: true,
            selected: false,
            uid: el.uid,
            position: position
          }
          this.displayedSlots.push(slot);
        });
      }
    });

    if (this.displayedSlots.length < 14) {

      // Add Waiting List members
      const waitingList = await this.getWaitingList();
      waitingList.forEach((waitee, index) => {
        const slot: Partial<ISlotOption> = {
          name: waitee.viewValue,
          booked: true,
          selected: false,
          uid: waitee.value,
          position: this.displayedSlots.length + index
        };
        this.displayedSlots.push(slot);
      });
    }

    if (this.displayedSlots.length < 14) {
      // Adding empty slots where position is not booked
      for (let i = 0; i < 14; i++) {
        const emptySlot: Partial<ISlotOption> = {
          name: '',
          booked: false,
          selected: false,
          uid: null,
          position: i
        }
        if (!this.displayedSlots.find(el => el.position === i)) {
          this.displayedSlots.push(emptySlot);
        }
      }
    }
    this.displayedSlots.sort(ArraySorting.sortObjectByKey('position'));
    this.emptySlotsCount = this.displayedSlots.filter(el => !el.name).length;
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

  getStarted() {
    this.showLoader();
    this.redirectToUrl('/signup', `/pickup-game/${this.season.id}/pay`);
  }

  participate() {
    this.resetLock();
    this.authService.isLoggedIn().subscribe({
      next: async (user) => {
        if (user && this.payableFees > 0) {
          this.showLoader();

          if (await this.isSlotLocked()) {
            this.snackBarService.displayError('Selected slot(s) is already booked!');
            this.hideLoader();
            return;
          }

          this.lockID = this.apiService.getUniqueDocID();
          const lockStatus = await this.lockSlot(user.uid);
          const totalSlots = this.displayedSlots.filter(el => el.selected && !el.booked).length;
          if (!lockStatus || !this.lockID || !totalSlots) {
            this.snackBarService.displayError("Error: Unable to book your slot!");
            this.resetLock();
            this.hideLoader();
            return;
          }

          const order = await this.paymentService.getNewOrder(user.uid, this.payableFees.toString());
          if (!order) {
            this.snackBarService.displayError("Error: Order generation failed!");
            this.resetLock();
            this.hideLoader();
            return;
          }

          const options: Partial<ICheckoutOptions> = {
            ...UNIVERSAL_OPTIONS,
            prefill: {
              contact: user.phoneNumber,
              name: user.displayName,
              email: user.email
            },
            description: `${this.season.name} x${totalSlots} Slot(s)`,
            order_id: order.id,
            amount: this.payableFees * 100,
            handler: this.handlePaymentSuccess.bind(this),
            modal: {
              backdropclose: false,
              escape: false,
              confirm_close: true,
              ondismiss: this.dismissDialog.bind(this)
            }
          }
          this.paymentService.openCheckoutPage(options);
        } else {
          this.redirectToUrl('/signup', `/pickup-game/${this.season.id}/pay`);
        }
      }
    })
  }

  async isSlotLocked(): Promise<boolean> {
    const lockedSlot: ILockedSlot = await this.apiService.getLockedSlots(this.seasonID).toPromise();
    if (lockedSlot && lockedSlot.lockedSlots?.length) {
      return this.displayedSlots.some(element => element.selected && lockedSlot.lockedSlots.includes(element.position) && !this.isLockExpired(lockedSlot.timestamp));
    }
    return false;
  }

  isLockExpired(timestamp: number): boolean {
    const current = new Date().getTime();
    const diff = current - timestamp;
    return diff > MatchConstants.FIVE_MINUTES_IN_MILLIS;
  }

  async lockSlot(uid: string): Promise<any> {
    const selectedSlots: number[] = [];
    this.displayedSlots.forEach(dpSlot => {
      if (dpSlot.selected) {
        selectedSlots.push(dpSlot.position);
      }
    })
    if (selectedSlots.length && this.lockID) {
      const data: ILockedSlot = {
        uid,
        seasonID: this.seasonID,
        lockedSlots: selectedSlots,
        timestamp: new Date().getTime()
      }
      try {
        await this.apiPostService.lockPickupSlot(this.lockID, data)
        return true;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  openOrder(orderID: string) {
    if (orderID) {
      this.router.navigate(['/order', orderID])
    }
  }

  handlePaymentSuccess(response): void {
    if (response) {
      this.showLoader();
      this.paymentService.verifyPayment(response)
        .subscribe({
          next: (response) => {
            if (response) {
              Promise.all(this.getPromises(response))
                .then(() => {
                  const uid = this.authService.getUser()?.uid || null;
                  this.snackBarService.displayCustomMsg('Your slot has been booked!');
                  if (uid) {
                    this.generateRewardService.completeActivity(RewardableActivities.joinPickupGame, uid);
                  }
                  this.openOrder(response['razorpay_order_id']);
                  this.resetFees();
                  this.slotsSubscriptions.unsubscribe();
                })
                .catch((error) => {
                  this.snackBarService.displayError(error?.message);
                })
                .finally(() => {
                  this.dismissDialog();
                })
            }
          },
          error: (error) => {
            this.dismissDialog();
            this.snackBarService.displayError(error?.message);
          }
        });
    } else {
      this.dismissDialog();
      this.snackBarService.displayError('Error: Payment Verification could not be initiated!');
    }
  }

  deleteLock() {
    this.apiPostService.deleteLockedPickupSlot(this.lockID);
  }

  resetFees() {
    this.payableFees = 0;
  }

  resetLock() {
    this.lockID = null;
  }

  getPromises(response): any[] {
    const uid = this.authService.getUser()?.uid || null;
    const totalSlots = this.displayedSlots.filter(el => el.selected).length;

    const selectedPositions: number[] = [];
    this.displayedSlots.forEach(slot => {
      if (slot.selected) {
        selectedPositions.push(slot.position);
      }
    });


    const update: Partial<IPickupGameSlot> = {
      slots: selectedPositions
    }

    if (uid) {
      const allPromises = [];
      let pickupSlotID = this.apiService.getUniqueDocID();

      const existingSlot = this.allSlots?.find(el => el.uid === uid);
      if (existingSlot?.hasOwnProperty('slots')) {

        pickupSlotID = existingSlot.id;
        update.slots = update.slots.concat(existingSlot.slots);
        allPromises.push(this.apiPostService.updatePickupSlot(existingSlot.id, update));

      } else {

        const data: IPickupGameSlot = {
          slots: selectedPositions,
          uid: uid,
          timestamp: new Date().getTime(),
          seasonID: this.seasonID,
        }
        allPromises.push(this.apiPostService.savePickupSlotWithCustomID(pickupSlotID, data));

      }

      const options: Partial<RazorPayOrder> = {
        notes: {
          associatedEntityID: this.season.id,
          associatedEntityName: this.season.name,
          purchaseQty: totalSlots,
          cancelledQty: 0,
          qtyEntityID: pickupSlotID,
          logs: [
            `Purchased ${totalSlots} slot(s) on ${this.datePipe.transform(new Date(), 'short')}`
          ]
        }
      }
      allPromises.push(this.paymentService.saveOrder(options, response).toPromise());

      return allPromises;
    }
  }

  openWaitingList() {
    const user = this.authService.getUser();
    if (user) {
      this.dialog.open(WaitingListDialogComponent, {
        panelClass: 'fk-dialogs',
        data: this.season,
      });
    } else {
      this.redirectToUrl('/signup', `/pickup-game/${this.season.id}/waiting-list`);
    }
  }

  dismissDialog() {
    this.hideLoader();
    if (this.lockID) {
      this.deleteLock();
    }
  }

  showLoader() {
    this.isLoaderShown = true;
    this.cdr.detectChanges();
  }

  hideLoader() {
    this.isLoaderShown = false;
    this.cdr.detectChanges();
  }

}
