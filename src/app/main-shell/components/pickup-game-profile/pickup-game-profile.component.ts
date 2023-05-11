import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { authUserMain } from '@shared/interfaces/user.model';
import { SnackbarService } from '@shared/services/snackbar.service';
import { IPickupGameSlot, ISlotOption } from '@shared/interfaces/game.model';
import { ListOption } from '@shared/interfaces/others.model';
import { Formatters } from '@shared/interfaces/team.model';
import { ApiGetService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import { Subscription } from 'rxjs';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { IPaymentOptionModes, IPaymentOptions, PaymentOptionsPickupGameComponent } from '../payment-options-pickup-game/payment-options-pickup-game.component';
import { ISaveInfo, PickupGameService } from '@app/main-shell/services/pickup-game.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ICheckoutOptions } from '@shared/interfaces/order.model';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';

@Component({
  selector: 'app-pickup-game-profile',
  templateUrl: './pickup-game-profile.component.html',
  styleUrls: ['./pickup-game-profile.component.scss'],
  providers: [CurrencyPipe, DatePipe]
})
export class PickupGameProfileComponent implements AfterViewInit, OnDestroy {

  readonly oneHourMilliseconds = 3600000;
  readonly ONE_SIDE_COUNT = 7;

  seasonID: string = null;
  season: Partial<SeasonAllInfo> = null;
  isLoaderShown = false;
  startDate = '';
  ground: ListOption;
  ageCatFormatter: any;
  displayedSlots: Partial<ISlotOption>[] = [];
  allSlots: IPickupGameSlot[] = [];
  reportingTime: number = null;
  amount = 0;
  emptySlotsCount = 0;
  subscriptions = new Subscription();
  slotsSubscriptions = new Subscription();
  currentLockID = null;
  user: authUserMain = null;
  isGameFinished = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiGetService,
    private router: Router,
    private paymentService: PaymentService,
    private authService: AuthService,
    private snackBarService: SnackbarService,
    private generateRewardService: GenerateRewardService,
    private _bottomSheet: MatBottomSheet,
    private pickupGameService: PickupGameService
  ) { }

  ngAfterViewInit(): void {
    this.ageCatFormatter = Formatters;
    this.authService.isLoggedIn()
      .subscribe(user => {
        if (user) {
          this.user = user;
        }
      });
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('seasonid')) {
          this.seasonID = params['seasonid'];
          this.getSeasonInfo();
        }
      }
    }));
    this.snackBarService.displayCustomMsg('Please select slots to confirm');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.slotsSubscriptions.unsubscribe();
  }

  getSeasonInfo(): void {
    if (this.seasonID) {
      this.showLoader();
      this.subscriptions.add(this.apiService.getSeasonAllInfo(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.season = response;
              this.startDate = this.pickupGameService.getStartDate(this.season.startDate);
              const today = new Date().getTime();
              this.isGameFinished = today > this.season.startDate;
              this.reportingTime = this.pickupGameService.getReportingTime(this.season.startDate);
              this.amount = 0;
              this.getSeasonMatches();
              this.getSeasonBookedSlots();
            } else {
              this.router.navigate(['/error']);
            }
            this.hideLoader();
            window.scrollTo(0, 0);
          },
          error: (error) => {
            this.hideLoader();
            this.snackBarService.displayError();
            this.router.navigate(['/error']);
          }
        }))
    }
  }

  getSeasonMatches() {
    if (this.season?.name) {
      this.apiService.getSeasonMatches(this.season.name)
        .subscribe({
          next: (response) => {
            this.ground = this.pickupGameService.getMatchGround(response[0])
          },
          error: (error) => {
            this.ground = this.pickupGameService.getMatchGround(null);
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
              this.parseSlots(response);
            }
          },
          error: () => {
            this.allSlots = [];
            this.parseSlots(null);
          }
        }))
    }
  }

  async parseSlots(response: IPickupGameSlot[]) {
    this.allSlots = response || [];
    this.displayedSlots = this.pickupGameService.createSlots(response);
    this.emptySlotsCount = 0;

    // Add Waiting List members
    if (this.displayedSlots.length < this.ONE_SIDE_COUNT * 2) {
      const waitingList = await this.pickupGameService.getWaitingList(this.seasonID);
      if (waitingList) {
        waitingList.forEach((element, index) => {
          const slot: Partial<ISlotOption> = {
            name: element.viewValue,
            booked: true,
            selected: false,
            uid: element.value,
            position: this.displayedSlots.length + index
          };
          if (this.displayedSlots.length < this.ONE_SIDE_COUNT * 2) {
            this.displayedSlots.push(slot);
          }
        });
      }
    }

    // Adding empty slots where position is not booked
    if (this.displayedSlots.length < this.ONE_SIDE_COUNT * 2) {
      for (let i = 0; i < this.ONE_SIDE_COUNT * 2; i++) {
        if (!this.displayedSlots.find(el => el.position === i) && this.displayedSlots.length < this.ONE_SIDE_COUNT * 2) {
          this.displayedSlots.push(this.pickupGameService.getEmptySlot(i));
        }
      }
    }

    this.displayedSlots.sort(ArraySorting.sortObjectByKey('position'));
    this.emptySlotsCount = this.displayedSlots.filter(el => !el.name).length;
  }

  selectSlot(slot: Partial<ISlotOption>) {
    if (this.user && slot.uid === this.user.uid) {
      this.router.navigate(['/orders']);
      return;
    }
    if (slot.booked) {
      return;
    }
    if (this.isGameFinished) {
      this.snackBarService.displayCustomMsg('Game is finished!');
      return;
    }
    if (!slot.selected) {
      this.amount += this.season.fees;
    } else {
      this.amount -= this.season.fees;
    }
    slot.selected = !slot.selected;
  }

  async getStarted() {
    if (this.amount <= 0) {
      return;
    }
    this.showLoader();
    const isLoggedIn = this.user?.uid !== null;

    if (!isLoggedIn) {
      // User is not signed up
      this.hideLoader();
      this.pickupGameService.redirectToUrl('/signup', `/pickup-game/${this.season.id}`);
    } else if (isLoggedIn && !await this.authService.isProfileExists(this.user)) {
      // User is signed up but not on-boarded
      this.hideLoader();
      this.pickupGameService.redirectToUrl('/onboarding', `/pickup-game/${this.season.id}`);
    } else if (await this.paymentService.isPendingOrder(this.user.uid)) {
      // User is not signed up
      this.hideLoader();
      this.snackBarService.displayError('Complete your pending payments!');
      this.pickupGameService.redirectToUrl('/pending-payments', `/pickup-game/${this.season.id}`);
    } else {
      // User has completed signup and onboarding
      this.hideLoader();
      this.openOptions();
    }
  }

  async openOptions() {
    const totalSlots = this.displayedSlots.filter(el => el.selected).length;
    const userPoints = await this.apiService.getUserPoints(this.user.uid).toPromise();
    const bookingAmount = await this.getBookingAmt();
    const options: MatBottomSheetConfig = this.pickupGameService.getPaymentOptions(userPoints?.points, this.amount, totalSlots, bookingAmount);
    const response: IPaymentOptions = await this._bottomSheet.open(PaymentOptionsPickupGameComponent, options).afterDismissed().toPromise();
    this.showLoader();
    if (!response || !await this.checkSlotAvailability()) {
      this.hideLoader();
      return;
    }
    switch (response.mode) {
      case IPaymentOptionModes.freekykPoints:
        this.payWithPoints(userPoints.points);
        break;

      case IPaymentOptionModes.payNow:
        this.payNow();
        break;

      case IPaymentOptionModes.bookOnline:
        this.payAtVenue(bookingAmount, false);
        break;

      case IPaymentOptionModes.bookWithCash:
        this.payAtVenue(bookingAmount, true);
        break;

      default:
        this.snackBarService.displayError('Error: Invalid option selected!');
        this.hideLoader();
        break;
    }
  }

  async checkSlotAvailability(): Promise<any> {
    this.showLoader();
    // Check if slot is already locked
    if (await this.pickupGameService.isSlotLocked(this.displayedSlots, this.seasonID)) {
      this.snackBarService.displayError('Error: Selected slot(s) is not available to book');
      this.hideLoader();
      return false;
    } else {
      // lock the slot
      this.currentLockID = this.apiService.getUniqueDocID();
      const lockStatus = await this.pickupGameService.lockSlot(this.user.uid, this.currentLockID, this.seasonID, this.displayedSlots);
      if (!lockStatus || !this.currentLockID) {
        this.snackBarService.displayError('Error: Unable to book your slot!');
        this.hideLoader();
        return false;
      }
    }
    return true;
  }

  async payWithPoints(points: number) {
    if (this.amount > points) {
      this.pickupGameService.redirectToUrl(`/rewards/purchase/${this.amount - points}`, `/pickup-game/${this.season.id}`)
      this.dismiss();
      return;
    }
    try {
      await this.paymentService.payWithPoints(this.user, this.amount);
      const data: ISaveInfo = {
        displaySlots: this.displayedSlots,
        allSlots: this.allSlots,
        uid: this.user.uid,
        season: this.season,
        amount: this.amount,
        orderID: this.apiService.getUniqueDocID()
      }
      const saveResult = await this.pickupGameService.savePointsOrderInfo(data);
      if (saveResult) {
        this.onConfirmSlot(data.orderID);
        return;
      } else {
        this.snackBarService.displayError('Error: Unable to confirm slot!');
        this.hideLoader();
        return;
      }

    } catch (error) {
      this.hideLoader();
      this.snackBarService.displayError('Error: Payment Initiate Failed')
    }
  }

  async payNow() {
    if (this.amount > 0) {
      this.showLoader();
      const order = await this.paymentService.getNewOrder(this.user.uid, this.amount.toString(), null);
      if (!order) {
        this.snackBarService.displayError("Error: Order generation failed!");
        this.hideLoader();
        return null;
      }
      this.openCheckoutOptions(order.id, this.amount, this.handlePayNowVerification.bind(this));
    } else {
      this.dismiss();
      this.snackBarService.displayError('Error: Invalid bill amount.');
    }
  }

  async payAtVenue(bookingAmount: number, isCash: boolean) {
    if (bookingAmount >= 0 && this.amount > 0) {
      this.showLoader();
      const order = await this.paymentService.getNewOrder(this.user.uid, this.amount.toString(), bookingAmount.toString());
      if (!order) {
        this.snackBarService.displayError("Error: Order generation failed!");
        this.hideLoader();
        return null;
      }
      if (isCash) {
        const remainingAmount = this.amount - bookingAmount;
        this.openCheckoutOptions(order.id, bookingAmount, this.handlePayAtVenueVerification.bind(this, remainingAmount));
      } else {
        this.openCheckoutOptions(order.id, bookingAmount, this.handlePayAtVenueVerification.bind(this, 0));
      }
    } else {
      this.dismiss();
      this.snackBarService.displayError('Error: Invalid booking/bill amount.');
    }
  }

  openCheckoutOptions(orderID: string, amount: number, verificationCallback: (response) => Promise<any>) {
    if (orderID) {
      const totalSlots = this.displayedSlots.filter(el => el.selected && !el.booked).length;
      const options: Partial<ICheckoutOptions> = {
        ...UNIVERSAL_OPTIONS,
        prefill: {
          contact: this.user.phoneNumber,
          name: this.user.displayName,
          email: this.user.email,
        },
        description: `${this.season.name} x${totalSlots} Slot(s)`,
        order_id: orderID,
        amount,
        handler: this.paymentVerify.bind(this, verificationCallback),
        modal: {
          backdropclose: false,
          escape: false,
          confirm_close: true,
          ondismiss: this.dismiss.bind(this)
        }
      }
      options.prefill.partial_payment = true;

      // Open Checkout Page
      this.paymentService.openCheckoutPage(options);
    } else {
      this.snackBarService.displayError('Error: Invalid Order details!');
    }
  }

  async paymentVerify(postVerify: (data) => Promise<any>, response) {
    this.showLoader();
    try {
      const verificationResult = await this.paymentService.verifyPayment(response).toPromise();
      if (verificationResult && postVerify) {
        postVerify(response);
      }
    } catch (error) {
      this.dismiss();
      this.snackBarService.displayError(error?.message || 'Error: Payment verification failed!');
    }
  }

  async handlePayNowVerification(response) {
    try {
      const data: ISaveInfo = {
        displaySlots: this.displayedSlots,
        allSlots: this.allSlots,
        uid: this.user.uid,
        season: this.season,
        response
      }
      const saveResult = await this.pickupGameService.savePayNowOrderInfo(data);
      if (saveResult) {
        this.onConfirmSlot(response['razorpay_order_id']);
      }
    } catch (error) {
      this.dismiss();
      this.snackBarService.displayError(error?.message || 'Error: Payment verification failed!');
    }
  }

  async handlePayAtVenueVerification(cashPending: number = 0, response) {
    try {
      const data: ISaveInfo = {
        displaySlots: this.displayedSlots,
        allSlots: this.allSlots,
        uid: this.user.uid,
        season: this.season,
        response,
        cashPending
      }
      const saveResult = await this.pickupGameService.savePayLaterOrderInfo(data);
      if (saveResult) {
        this.onConfirmSlot(response['razorpay_order_id']);
      }
    } catch (error) {
      this.dismiss();
      this.snackBarService.displayError(error?.message || 'Error: Payment verification failed!');
    }

  }

  // async payLater() {
  //   this.showLoader();

  //   // generate order
  //   const order = await this.getOrder();
  //   if (order) {
  //     await this.generateRewardService.subtractPoints(this.paymentOption.pointsUsed, this.user.uid, 'by spending on game');

  //     const data = {
  //       displaySlots: this.displayedSlots,
  //       allSlots: this.allSlots,
  //       uid: this.user.uid,
  //       season: this.season,
  //       response: {

  //       }
  //     }
  //     const saveResult = Promise.all([this.pickupGameService.saveInfo(data)]);
  //     if (saveResult) {
  //       this.snackBarService.displayCustomMsg('Your slot has been confirmed!');
  //       this.generateRewardService.completeActivity(RewardableActivities.joinPickupGame, this.user.uid);
  //       this.pickupGameService.openOrder(order.id);
  //       this.hideLoader();
  //     }
  //   }

  // }

  onConfirmSlot(orderID: string) {
    this.snackBarService.displayCustomMsg('Your slot has been confirmed!');
    this.generateRewardService.completeActivity(RewardableActivities.joinPickupGame, this.user.uid);
    this.pickupGameService.openOrder(orderID);
    this.hideLoader();
  }

  dismiss() {
    this.hideLoader();
    if (this.currentLockID) {
      this.pickupGameService.deleteLock(this.currentLockID)
    }
  }

  async getOrder() {
    const order = await this.paymentService.getNewOrder(this.user.uid, this.amount.toString(), null);
    if (!order) {
      this.snackBarService.displayError("Error: Order generation failed!");
      this.hideLoader();
      return null;
    }
    return order;
  }

  openGround(data: ListOption) {
    this.pickupGameService.openGround(data);
  }

  async openWaitingList() {
    const isLoggedIn = this.user.uid !== null;
    const isOnBoarded = await this.authService.isProfileExists(this.user);
    this.pickupGameService.openWaitingList(isLoggedIn, isOnBoarded, this.season);
  }

  async getBookingAmt(): Promise<number> {
    return 10;
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
  }
}
