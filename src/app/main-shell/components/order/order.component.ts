import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@shared/services/snackbar.service';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { ICheckoutOptions, IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { ISeason } from '@shared/interfaces/season.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { Subscription } from 'rxjs';
import { SelectQuantityComponent } from '../select-quantity/select-quantity.component';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { MatchConstants } from '@shared/constants/constants';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { ORDER_CANCELLATION_POLICY } from '@shared/web-content/LEGAL_CONTENT';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { AuthService } from '@app/services/auth.service';
import { IEarnedRewardDialogData } from '../reward-earn-dialog/reward-earn-dialog.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [DatePipe]
})
export class OrderComponent implements OnInit, OnDestroy {

  readonly type = IItemType;

  gstAmount = 0;
  amount = 0;
  order: Partial<RazorPayOrder>;
  showSuccess = false;
  subscriptions = new Subscription();
  orderID: string;
  isLoaderShown = false;
  season: ISeason;
  isPendingAmount = false;
  isPendingCash = false;

  constructor(
    private router: Router,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private paymentService: PaymentService,
    private generateRewardService: GenerateRewardService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('orderid')) {
          this.orderID = params['orderid'];
          this.getOrder();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getOrder() {
    if (this.orderID) {
      this.showLoader();
      this.apiService.getOrder(this.orderID)
        .subscribe({
          next: response => {
            if (response) {
              this.order = response;
              this.getSeason();
              this.calculateOrderValues();
              this.showSuccess = true;
            } else {
              this.router.navigate(['/orders']);
              this.snackbarService.displayError('Error: Unable to get order details!');
            }
            this.hideLoader();
          },
          error: (error) => {
            this.snackbarService.displayError('Error: Unable to get order details!');
            this.hideLoader();
            this.router.navigate(['/orders']);
          }
        })
    }
  }

  calculateOrderValues() {
    let amountTemp = (this.order?.amount / 100);
    if (this.order?.notes?.pointsUsed > 0) {
      amountTemp -= this.order?.notes?.pointsUsed;
    }
    this.isPendingAmount = this.order.amount_due > (this.order?.notes?.pointsUsed || 0);
    this.isPendingCash = this.order?.notes?.cashPending >= 0
    this.gstAmount = 0.18 * amountTemp;
    this.amount = amountTemp - this.gstAmount;
  }

  goBack() {
    this.router.navigate(['/orders']);
  }

  getSeason() {
    if (this.order?.notes?.seasonID) {
      this.apiService.getSeason(this.order.notes.seasonID).subscribe({
        next: (response) => {
          this.season = response;
        },
        error: () => {
          this.season = null;
        }
      })
    }
  }

  openSeason() {
    if (this.season) {
      if (this.season.type === 'Pickup') {
        this.router.navigate(['/pickup-game', this.season.id]);
      } else {
        this.router.navigate(['/game', this.season.id]);
      }
    }
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
  }

  async cancelOrder() {
    this.showLoader();
    const slots = this.cancellableQty();
    if (this.order.notes.itemType !== this.type.pickupSlot) {
      this.hideLoader();
      this.snackbarService.displayError('Error: No slots to cancel!');
      return;
    } else if (slots < 1 || !slots) {
      this.hideLoader();
      this.snackbarService.displayError('Error: No slots to cancel!');
      return;
    } else if ((await this.apiService.isPickupGameOrderCancellable(this.order?.notes?.seasonName).toPromise())) {
      this.hideLoader();
      if (slots === 1) {
        this.parsPickupSlot(1, slots);
      } else {
        const dialogRef = this.dialog.open(SelectQuantityComponent, { data: slots })
        dialogRef.afterClosed()
          .subscribe({
            next: (count) => {
              if (count > 0 && count <= slots) {
                this.parsPickupSlot(count, slots);
              }
            }
          })
      }
    } else {
      this.hideLoader();
      this.snackbarService.displayError('Error: Cancellation not allowed!');
    }
  }

  async parsPickupSlot(count: number, slots: number) {
    this.showLoader();
    const pickupSlot = (await this.apiService.getPickupSlot(this.order?.notes?.itemID).toPromise());
    if (pickupSlot?.slots?.length) {
      pickupSlot.slots.sort();
      const slot = JSON.parse(JSON.stringify(pickupSlot));
      for (let i = 0; i < count; i++) {
        if (slot.slots.length) {
          slot.slots.pop();
        }
      }
      const update: Partial<IPickupGameSlot> = {
        slots: slot.slots
      }

      this.order.notes.logs.push(`Cancelled ${count} slot(s) on ${this.datePipe.transform(new Date(), 'short')}`);
      this.order.notes.itemCancelledQty += count;
      const orderUpdate: Partial<RazorPayOrder> = {
        notes: this.order.notes
      }

      // Refund Amount is 50% of total cancellable slots amount
      let refundAmt = 0;
      refundAmt = (count * this.season.fees) * MatchConstants.ORDER_REFUND_MULTIPLIER;
      const playerID = this.order.receipt;

      if (refundAmt > 0) {
        const allPromises = [];
        allPromises.push(this.apiPostService.updateOrder(orderUpdate, this.orderID));
        allPromises.push(this.generateRewardService.addPoints(refundAmt, playerID, 'Order Refund'));
        if (slot.slots.length <= 0) {
          allPromises.push(this.apiPostService.deletePickupSlot(slot.id));
        } else {
          allPromises.push(this.apiPostService.updatePickupSlot(slot.id, update));
        }

        Promise.all(allPromises)
          .then(() => {
            this.snackbarService.displayCustomMsg(count + ' slot(s) cancelled successfully!');
            const data: IEarnedRewardDialogData = {
              points: refundAmt,
              activityID: null,
              isAdded: true,
              showCTA: true,
            }
            this.generateRewardService.openRewardDialog(data);
          })
          .catch(() => {
            this.snackbarService.displayError();
          })
          .finally(() => {
            this.getOrder();
            this.hideLoader();
          })
      }
    } else {
      this.hideLoader();
      this.snackbarService.displayError('Error: Pickup slot not found!')
    }
  }

  get isCancellable() {
    return this.cancellableQty() >= 1;
  }

  cancellableQty(): number {
    const quantity = this.order?.notes?.itemQty;
    const cancelledQty = this.order?.notes?.itemCancelledQty;
    if (cancelledQty === null || cancelledQty === undefined) {
      return 0;
    }
    return quantity - cancelledQty;
  }

  viewPolicy() {
    const data: IFeatureInfoOptions = {
      heading: 'Order Cancellation Policy',
      multiDescription: [
        { description: ORDER_CANCELLATION_POLICY }
      ]
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'fk-dialogs',
      data
    })
  }

  triggerAction() {
    if (this.order.notes.itemType === this.type.pointsPurchase) {
      this.router.navigate(['/games']);
    } else if (this.order.notes.itemType === this.type.pickupSlot) {
      this.openSeason();
    }
  }

  payRemaining() {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (this.isPendingAmount && !this.isPendingCash && this.orderID && this.order?.amount_due > 0 && user) {
          const checkoutOptions: Partial<ICheckoutOptions> = {
            ...UNIVERSAL_OPTIONS,
            prefill: {
              contact: user.phoneNumber,
              name: user.displayName,
              email: user.email
            },
            order_id: this.orderID,
            amount: this.order?.amount_due * 100,
            handler: this.verifyPayment.bind(this),
            modal: {
              backdropclose: false,
              escape: false,
              confirm_close: true,
              ondismiss: this.dismiss.bind(this)
            },
          };
          this.paymentService.openCheckoutPage(checkoutOptions);
        }
      }
    });
  }

  async verifyPayment(response) {
    if (response) {
      this.showLoader();
      try {
        const verificationResult = await this.paymentService.verifyPayment(response).toPromise();
        if (verificationResult) {
          const logs = this.order.notes.logs;
          logs.push(`Paid partial amount on ${this.datePipe.transform(new Date(), 'short')}`);
          const update: Partial<RazorPayOrder> = {
            notes: {
              ...this.order.notes,
              logs
            }
          }
          const saveResult = await this.paymentService.updateOrder(update, this.orderID).toPromise();
          if (saveResult) {
            this.snackbarService.displayCustomMsg('Your partial payment is successful!');
            this.getOrder();
            this.hideLoader();
          }
        }
      } catch (error) {
        this.hideLoader();
        this.snackbarService.displayError(error?.message);
      }
    }
  }

  dismiss() {
    this.hideLoader();
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }
}
