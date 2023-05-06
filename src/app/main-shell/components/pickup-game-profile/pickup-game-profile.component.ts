import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import { ILockedSlot, IPickupGameSlot, ISlotOption } from '@shared/interfaces/game.model';
import { ICheckoutOptions } from '@shared/interfaces/order.model';
import { ListOption } from '@shared/interfaces/others.model';
import { Formatters } from '@shared/interfaces/team.model';
import { ApiGetService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import { Subscription } from 'rxjs';
import { WaitingListDialogComponent } from '../waiting-list-dialog/waiting-list-dialog.component';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { IPaymentOption, IPaymentOptionsData, ISelectedPaymentOption, PaymentOptionsPickupGameComponent } from '../payment-options-pickup-game/payment-options-pickup-game.component';
import { PickupGameService } from '@app/main-shell/services/pickup-game.service';



@Component({
  selector: 'app-pickup-game-profile',
  templateUrl: './pickup-game-profile.component.html',
  styleUrls: ['./pickup-game-profile.component.scss'],
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
  paymentOption: ISelectedPaymentOption = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiGetService,
    private router: Router,
    private dialog: MatDialog,
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
      const waitingList = await this.getWaitingList();
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
    const isLoggedIn = this.user.uid !== null;
    const isOnBoarded = await this.authService.isProfileExists(this.user);
    if (isLoggedIn && isOnBoarded) {
      // User has completed signup and onboarding
      this.hideLoader();
      this.openOptions();
    } else if (isLoggedIn && !isOnBoarded) {
      // User is signed up but not on-boarded
      this.hideLoader();
      this.pickupGameService.redirectToUrl('/onboarding', `/pickup-game/${this.season.id}`);
    } else {
      // User is not signed up
      this.hideLoader();
      this.pickupGameService.redirectToUrl('/signup', `/pickup-game/${this.season.id}`);
    }
  }

  async openOptions() {
    const userPoints = await this.apiService.getUserPoints(this.user.uid).toPromise();
    const options = {
      data: {
        credit: userPoints?.points || 0,
        amount: this.amount
      } as IPaymentOptionsData
    }
    const response: ISelectedPaymentOption = await this._bottomSheet.open(PaymentOptionsPickupGameComponent, options).afterDismissed().toPromise();
    if (response && (response.pointsUsed > 0 || response.amount > 0)) {
      this.paymentOption = response;
      switch (this.paymentOption.mode) {
        case IPaymentOption.payNow:
          if (await this.prepareSlotSuccess()) {
            this.payNow();
          }
          break;
        case IPaymentOption.payLater:
          if (await this.prepareSlotSuccess()) {
            this.payLater();
          }
          break;
        case IPaymentOption.customCode:
          break;

        default:
          this.snackBarService.displayError('Please select an option!');
          break;
      }
    } else {
      this.snackBarService.displayError('Error: Invalid option selected!');
    }
  }

  async prepareSlotSuccess(): Promise<any> {
    this.showLoader();
    // Check if slot is already locked
    if (await this.isSlotLocked()) {
      this.snackBarService.displayError('Error: Selected slot(s) is already booked!');
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

  async payNow() {
    this.showLoader();

    // If points are used, subtract points and save log
    let order;
    let pointsDeduction;

    if (this.paymentOption.pointsUsed > 0 && this.paymentOption.amount > 0) {
      pointsDeduction = await this.generateRewardService.subtractPoints(this.paymentOption.pointsUsed, this.user.uid, 'by spending on game');
      if (!pointsDeduction) {
        this.snackBarService.displayError("Error: Unable to use points for booking!");
        this.hideLoader();
        return null;
      }
      order = await this.paymentService.getNewOrder(this.user.uid, this.amount.toString(), null);
      if (!order) {
        this.snackBarService.displayError("Error: Order generation failed!");
        this.hideLoader();
        return null;
      }
    }

    // If actual money is used, generate razorpay order
    if (this.paymentOption.amount > 0) {

    }
  }

  openCheckoutOptions(orderID: string, amount: number) {
    if (orderID) {
      // create payment options
      const totalSlots = this.displayedSlots.filter(el => el.selected && !el.booked).length;
      const options: Partial<ICheckoutOptions> = {
        ...UNIVERSAL_OPTIONS,
        prefill: {
          contact: this.user.phoneNumber,
          name: this.user.displayName,
          email: this.user.email
        },
        description: `${this.season.name} x${totalSlots} Slot(s)`,
        order_id: orderID,
        amount: amount * 100,
        handler: this.paymentVerify.bind(this),
        modal: {
          backdropclose: false,
          escape: false,
          confirm_close: true,
          ondismiss: this.dismiss.bind(this)
        }
      }

      // Open Checkout Page
      this.paymentService.openCheckoutPage(options);
    } else {
      this.snackBarService.displayError('Error: Invalid Order details!');
    }
  }

  async paymentVerify(response) {
    this.showLoader();

    try {
      const verificationResult = await this.paymentService.verifyPayment(response).toPromise();
      if (verificationResult) {
        const data = {
          displaySlots: this.displayedSlots,
          allSlots: this.allSlots,
          uid: this.user.uid,
          season: this.season,
          response
        }
        const saveResult = Promise.all(this.pickupGameService.saveInfo(data));
        if (saveResult) {
          this.snackBarService.displayCustomMsg('Your slot has been confirmed!');
          this.generateRewardService.completeActivity(RewardableActivities.joinPickupGame, this.user.uid);
          console.log(response);
          this.pickupGameService.openOrder(response['razorpay_order_id']);
          this.hideLoader();
        }
      }
    } catch (error) {
      this.hideLoader();
      this.snackBarService.displayError(error?.message);
    }
  }

  dismiss() {
    this.hideLoader();
    if (this.currentLockID) {
      this.pickupGameService.deleteLock(this.currentLockID)
    }
  }

  async payLater() {
    this.showLoader();

    // generate order
    const order = await this.getOrder();
    if (order) {
      await this.generateRewardService.subtractPoints(this.paymentOption.pointsUsed, this.user.uid, 'by spending on game');

      const data = {
        displaySlots: this.displayedSlots,
        allSlots: this.allSlots,
        uid: this.user.uid,
        season: this.season,
        response: {

        }
      }
      const saveResult = Promise.all([this.pickupGameService.saveInfo(data)]);
      if (saveResult) {
        this.snackBarService.displayCustomMsg('Your slot has been confirmed!');
        this.generateRewardService.completeActivity(RewardableActivities.joinPickupGame, this.user.uid);
        this.pickupGameService.openOrder(order.id);
        this.hideLoader();
      }
    }

  }

  async isSlotLocked(): Promise<boolean> {
    const lockedSlot: ILockedSlot = await this.apiService.getLockedSlots(this.seasonID).toPromise();
    if (lockedSlot?.lockedSlots?.length) {
      return this.displayedSlots.some(element =>
        element.selected
        && lockedSlot.lockedSlots.includes(element.position)
        && !this.pickupGameService.isLockExpired(lockedSlot.timestamp)
      );
    }
    return false;
  }

  getWaitingList() {
    return this.apiService.getSeasonWaitingList(this.seasonID).toPromise();
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

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  async openWaitingList() {
    const isLoggedIn = this.user.uid !== null;
    const isOnBoarded = await this.authService.isProfileExists(this.user);
    if (isLoggedIn && isOnBoarded) {
      // User has completed signup and onboarding
      this.dialog.open(WaitingListDialogComponent, {
        panelClass: 'fk-dialogs',
        data: this.season,
      });
    } else if (isLoggedIn && !isOnBoarded) {
      // User is signed up but not on-boarded
      this.pickupGameService.redirectToUrl('/onboarding', `/pickup-game/${this.season.id}`);
    } else {
      // User is not signed up
      this.pickupGameService.redirectToUrl('/signup', `/pickup-game/${this.season.id}`);
    }
  }
}
