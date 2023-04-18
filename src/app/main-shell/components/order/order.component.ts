import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { SelectQuantityComponent } from '../select-quantity/select-quantity.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  gstAmount = 0;
  amount = 0;
  order: Partial<RazorPayOrder>;
  showSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<OrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private router: Router,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.getOrder();
  }

  getOrder() {
    if (this.data) {
      this.apiService.getOrder(this.data)
        .subscribe({
          next: response => {
            if (response) {
              this.order = response;
              this.calculateGst();
              this.showSuccess = true;
            }
          },
          error: (error) => {
            this.snackbarService.displayError();
            this.onCloseDialog();
          }
        })
    }
  }

  calculateGst() {
    const amountTemp = (this.order?.amount / 100);
    this.gstAmount = 0.18 * amountTemp;
    this.amount = amountTemp - this.gstAmount;
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
            this.onCloseDialog();
          }
        })
    }
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
    this.onCloseDialog();
  }

  cancelOrder() {
    this.dialog.open(SelectQuantityComponent).afterClosed()
      .subscribe({
        next: async (response) => {
          const slotsInOrder = Number(this.order?.description?.split(" ")[0] || 0);
          if (response > 0 && response <= slotsInOrder) {
            const pickupSlots = (await this.apiService.getPickupSlotByOrder(this.order).toPromise());
            if (pickupSlots && pickupSlots[0]) {
              console.log(pickupSlots[0]);
              pickupSlots[0].slots.sort();
              for (let i = 0; i < response; i++) {
                pickupSlots[0].slots.pop();
              }
              console.log(pickupSlots[0]);
              const update: Partial<IPickupGameSlot> = {
                slots: pickupSlots[0].slots
              }
              const allPromises = [];
              // allPromises.push(this.paymentService.initOrderRefund(this.order.id));
              if (pickupSlots[0].slots.length === 0) {
                allPromises.push(this.apiPostService.deletePickupSlot(pickupSlots[0].id));
              } else {
                allPromises.push(this.apiPostService.updatePickupSlot(pickupSlots[0].id, update));
              }
            }
          }
        }
      })
  }
}
