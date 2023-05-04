import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { ISeason } from '@shared/interfaces/season.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { Subscription } from 'rxjs';
import { SelectQuantityComponent } from '../select-quantity/select-quantity.component';

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

  constructor(
    private router: Router,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private paymentService: PaymentService
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
      this.isLoaderShown = true;
      this.apiService.getOrder(this.orderID)
        .subscribe({
          next: response => {
            if (response) {
              this.order = response;
              this.getSeason();
              this.calculateGst();
              this.showSuccess = true;
            } else {
              this.router.navigate(['/orders']);
            }
            this.isLoaderShown = false;
          },
          error: (error) => {
            this.snackbarService.displayError();
            this.isLoaderShown = false;
            this.router.navigate(['/orders']);
          }
        })
    }
  }

  calculateGst() {
    const amountTemp = (this.order?.amount / 100);
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
      if (this.season.type === 'FCP') {
        this.router.navigate(['/pickup-game', this.season.id]);
      } else {
        this.router.navigate(['/game', this.season.id]);
      }
    }
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
  }

  cancelOrder() {
    const slots = this.cancellableQty();
    if ((this.order.notes.itemType !== this.type.pickupSlot) || slots < 1 || !slots) {
      this.snackbarService.displayError('Error: No slots to cancel!');
      return;
    } else if (slots === 1) {
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
  }

  async parsPickupSlot(count: number, slots: number) {
    this.isLoaderShown = true;
    const pickupSlot = (await this.apiService.getPickupSlot(this.order?.notes?.itemID).toPromise());
    if (pickupSlot) {
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
      refundAmt = (count * this.season.fees) / 2;

      if (refundAmt > 0) {
        const allPromises = [];
        allPromises.push(this.apiPostService.updateOrder(orderUpdate, this.orderID));
        allPromises.push(this.paymentService.initOrderRefund(this.order, refundAmt));
        if (slot.slots.length <= 0) {
          allPromises.push(this.apiPostService.deletePickupSlot(slot.id));
        } else {
          allPromises.push(this.apiPostService.updatePickupSlot(slot.id, update));
        }

        Promise.all(allPromises)
          .then(() => {
            this.snackbarService.displayCustomMsg(count + ' slot(s) cancelled successfully!')
          })
          .catch(() => {
            this.snackbarService.displayError();
          })
          .finally(() => {
            this.getOrder();
            this.isLoaderShown = false;
          })
      }
    } else {
      this.isLoaderShown = false;
      this.snackbarService.displayError('Error: Pickup slot not found!')
    }
  }

  get isCancellable() {
    return this.cancellableQty() > 1;
  }

  cancellableQty(): number {
    const quantity = this.order?.notes?.itemQty;
    const cancelledQty = this.order?.notes?.itemCancelledQty;
    if (cancelledQty === null || cancelledQty === undefined) {
      return 0;
    }
    return quantity - cancelledQty;
  }

  refundOrder() {
    if (this.order.notes.itemType !== this.type.pointsPurchase) {
      return;
    }
    // refund order
    this.paymentService.initOrderRefund(this.order, this.order.amount)
  }

  triggerAction() {
    if (this.order.notes.itemType === this.type.pointsPurchase) {
      this.router.navigate(['/rewards', 'redeem']);
    } else if (this.order.notes.itemType === this.type.pickupSlot) {
      this.openSeason();
    }
  }
}
