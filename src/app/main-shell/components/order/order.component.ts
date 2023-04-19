import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { RazorPayOrder } from '@shared/interfaces/order.model';
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
            }
            this.isLoaderShown = false;
          },
          error: (error) => {
            this.snackbarService.displayError();
            this.isLoaderShown = false;
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
    if (this.order.seasonID) {
      this.apiService.getSeason(this.order.seasonID).subscribe({
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
    if (this.order?.seasonID && this.season) {
      if (this.season.type === 'FCP') {
        this.router.navigate(['/pickup-game', this.order.seasonID]);
      } else {
        this.router.navigate(['/game', this.order.seasonID]);
      }
    }
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
  }

  cancelOrder() {
    const slots = this.currentSlotsCount;
    if (slots > 1) {
      const dialogRef = this.dialog.open(SelectQuantityComponent, { data: slots })
      dialogRef.afterClosed()
        .subscribe({
          next: (response) => {
            if (response > 0 && response <= slots) {
              this.parsPickupSlot(response);
            }
          }
        })
    } else if (slots === 1) {
      this.parsPickupSlot(1);
    } else {
      this.snackbarService.displayError('Error: No slots to cancel!');
    }
  }

  async parsPickupSlot(response: number) {
    this.isLoaderShown = true;
    const slots = this.currentSlotsCount;
    const pickupSlots = (await this.apiService.getPickupSlotByOrder(this.order).toPromise());
    if (pickupSlots && pickupSlots[0]) {
      pickupSlots[0].slots.sort();
      const slot = JSON.parse(JSON.stringify(pickupSlots[0]));
      for (let i = 0; i < response; i++) {
        if (slot.slots.length) {
          slot.slots.pop();
        }
      }
      const update: Partial<IPickupGameSlot> = {
        slots: slot.slots
      }
      this.order.notes.push(`Cancelled ${response} slot(s) on ${this.datePipe.transform(new Date(), 'short')}`);
      const orderUpdate: Partial<RazorPayOrder> = {
        notes: this.order.notes,
        description: `${slots - response}`
      }

      // Refund Amount is 50% of total cancellable slots amount
      let refundAmt = 0;
      refundAmt = (response * this.season.fees) / 2;

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
            this.snackbarService.displayCustomMsg(response + ' Slot(s) cancelled successfully!')
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

  get currentSlotsCount() {
    return Number(this.order?.description);
  }
}
