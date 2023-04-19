import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { Subscription } from 'rxjs';
import { SelectQuantityComponent } from '../select-quantity/select-quantity.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {

  gstAmount = 0;
  amount = 0;
  order: Partial<RazorPayOrder>;
  showSuccess = false;
  subscriptions = new Subscription();
  orderID: string;
  isLoaderShown = false;

  constructor(
    private router: Router,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private route: ActivatedRoute
    // private paymentService: PaymentService
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

  openSeason() {
    if (this.order?.seasonID) {
      this.apiService.getSeasonType(this.order?.seasonID)
        .subscribe({
          next: (response) => {
            if (response === 'FCP') {
              this.router.navigate(['/pickup-game', this.order.seasonID]);
            } else {
              this.router.navigate(['/game', this.order.seasonID]);
            }
          }
        })
    }
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
  }

  cancelOrder() {
    const slotsInOrder = Number(this.order?.description?.split(" ")[0] || 0);
    if (slotsInOrder > 1) {
      const dialogRef = this.dialog.open(SelectQuantityComponent, { data: slotsInOrder })
      dialogRef.afterClosed()
        .subscribe({
          next: (response) => {
            if (response > 0 && response <= slotsInOrder) {
              this.parsPickupSlot(response);
            }
          }
        })
    } else if (slotsInOrder === 1) {
      this.parsPickupSlot(1);
    }
  }

  async parsPickupSlot(response: number) {
    this.isLoaderShown = true;
    const pickupSlots = (await this.apiService.getPickupSlotByOrder(this.order).toPromise());
    if (pickupSlots && pickupSlots[0]) {
      const slot = pickupSlots[0];
      slot.slots.sort();
      for (let i = 0; i < response; i++) {
        slot.slots.pop();
      }
      console.log(slot);
      const update: Partial<IPickupGameSlot> = {
        slots: slot.slots
      }
      const allPromises = [];
      if (slot.slots.length === 0) {
        const update: Partial<RazorPayOrder> = {
          description: `${slot.slots.length} Slot(s)`
        }

        allPromises.push(this.apiPostService.deletePickupSlot(slot.id));
        allPromises.push(this.apiPostService.updateOrder(update, this.orderID));
      } else {
        allPromises.push(this.apiPostService.updatePickupSlot(slot.id, update));
      }
      // allPromises.push(this.paymentService.initOrderRefund(this.order.id));
      Promise.all(allPromises)
        .then(() => {
          this.snackbarService.displayCustomMsg('Order cancelled successfully!')
        })
        .catch(() => {
          this.snackbarService.displayError();
        })
        .finally(() => {
          this.isLoaderShown = false;
        })
    }
  }
}
